import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/company/applications
 * Fetch ALL applications for the authenticated company
 * 🔒 SECURITY: Only returns applications for jobs owned by this company
 * 🔒 SECURITY: Filters by companyId from authenticated session
 */
export async function GET(req: Request) {
    console.log('[API] GET /api/company/applications - Request received');

    try {
        // 1. Authentication check
        const { userId } = await auth();

        if (!userId) {
            console.log('[API] Unauthorized - no userId');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Authorization check - Must be a company
        const user = await currentUser();
        const userRole = user?.unsafeMetadata?.userRole;

        if (userRole !== 'CLIENT') {
            console.log('[API] Forbidden - user is not a company');
            return NextResponse.json({
                error: "Forbidden - Only companies can view applications"
            }, { status: 403 });
        }

        // 3. 🔍 Parse filters from query params
        const { searchParams } = new URL(req.url);
        const statusParam = searchParams.get('status');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');

        // Construct where clause
        let whereClause: any = {
            companyId: userId
        };

        // Status mapping
        const statusMap: Record<string, string[]> = {
            'Active': ['APPLIED', 'SHORTLISTED', 'INTERVIEW'],
            'Inactive': ['REJECTED', 'HIRED'],
            'Withdrawn': ['WITHDRAWN']
        };

        if (statusParam && statusMap[statusParam]) {
            whereClause.status = { in: statusMap[statusParam] };
        }

        // Date range filtering
        if (fromDate || toDate) {
            whereClause.appliedAt = {};
            if (fromDate) whereClause.appliedAt.gte = new Date(fromDate);
            if (toDate) whereClause.appliedAt.lte = new Date(toDate);
        }

        // 4. Handle Default Filtering Logic if no status filter is provided
        let applications: any[] = [];

        if (!statusParam) {
            // Requirement: "By default, show only Active applications... If there are no Active applications, then show Inactive, Withdrawn"
            const activeApps = await (prisma.application as any).findMany({
                where: {
                    ...whereClause,
                    status: { in: statusMap['Active'] }
                },
                include: {
                    job: {
                        select: { id: true, title: true, category: true, employmentType: true, location: true, companyId: true }
                    }
                },
                orderBy: { appliedAt: 'desc' }
            });

            if (activeApps.length > 0) {
                applications = activeApps;
            } else {
                // Fetch Inactive and Withdrawn
                applications = await (prisma.application as any).findMany({
                    where: {
                        ...whereClause,
                        status: { in: [...statusMap['Inactive'], ...statusMap['Withdrawn']] }
                    },
                    include: {
                        job: {
                            select: { id: true, title: true, category: true, employmentType: true, location: true, companyId: true }
                        }
                    },
                    orderBy: { appliedAt: 'desc' }
                });
            }
        } else {
            // Fetch based on explicit status filter
            applications = await (prisma.application as any).findMany({
                where: whereClause,
                include: {
                    job: {
                        select: { id: true, title: true, category: true, employmentType: true, location: true, companyId: true }
                    }
                },
                orderBy: { appliedAt: 'desc' }
            });
        }

        // 5. 🔒 SECURITY: Verify all included jobs belong to this company
        const verified = applications.filter((app: any) =>
            app.job && app.job.companyId === userId
        );

        if (verified.length !== applications.length) {
            console.warn(
                `[SECURITY WARNING] Filtered out ${applications.length - verified.length} applications with mismatched companyId`
            );
        }

        // 6. Fetch Candidate Details
        const candidateIds = Array.from(new Set(verified.map((app: any) => app.candidateId)));

        const candidates = await prisma.user.findMany({
            where: {
                clerkId: { in: candidateIds }
            },
            select: {
                clerkId: true,
                name: true,
                email: true,
                profileImageUrl: true
            }
        });

        const candidateMap = new Map(candidates.map(c => [c.clerkId, c]));

        // 7. 🛡️ DATA RECOVERY: If any candidates are missing from DB, fetch from Clerk
        const enrichedApplications = await Promise.all(verified.map(async (app) => {
            let candidate = candidateMap.get(app.candidateId);

            if (!candidate) {
                console.log(`[API] Candidate ${app.candidateId} missing from local DB, fetching from Clerk...`);
                try {
                    const { clerkClient } = await import('@clerk/nextjs/server');
                    const cClient = await clerkClient();
                    const clerkUser = await cClient.users.getUser(app.candidateId);

                    if (clerkUser) {
                        candidate = {
                            clerkId: clerkUser.id,
                            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || 'Anonymous Candidate',
                            email: clerkUser.emailAddresses[0]?.emailAddress || 'N/A',
                            profileImageUrl: clerkUser.imageUrl
                        } as any;

                        // Optional: Proactively sync to DB
                        const syncName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || 'Anonymous Candidate';
                        const syncEmail = clerkUser.emailAddresses[0]?.emailAddress || 'N/A';

                        await prisma.user.upsert({
                            where: { clerkId: clerkUser.id },
                            update: {
                                name: syncName,
                                email: syncEmail,
                                profileImageUrl: clerkUser.imageUrl
                            },
                            create: {
                                clerkId: clerkUser.id,
                                name: syncName,
                                email: syncEmail,
                                profileImageUrl: clerkUser.imageUrl,
                                userRole: 'CANDIDATE'
                            }
                        }).catch(e => console.error('[API] Auto-sync failed:', e));
                    }
                } catch (clerkError) {
                    console.error(`[API] Failed to fetch candidate ${app.candidateId} from Clerk:`, clerkError);
                }
            }

            return {
                ...app,
                candidate: candidate || { name: 'Unknown Candidate', email: 'N/A', profileImageUrl: null }
            };
        }));

        console.log(`[API] Found ${verified.length} applications for company ${userId}`);
        return NextResponse.json(enrichedApplications);

    } catch (error: any) {
        console.error('[API] Error in GET /api/company/applications:', error);
        return NextResponse.json({
            error: "Failed to fetch applications",
            details: error.message
        }, { status: 500 });
    }
}
