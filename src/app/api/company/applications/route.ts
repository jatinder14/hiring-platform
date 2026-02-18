import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

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

        // 2. Authorization check - Always validate against DB for security
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        // 🛡️ DATA RECOVERY: If user missing or role mismatch, try strict sync from Clerk
        if (!dbUser || dbUser.userRole !== 'CLIENT') {
            console.log('[API] User missing or role mismatch in DB, attempting sync from Clerk...');
            try {
                const { clerkClient } = await import('@clerk/nextjs/server');
                const client = await clerkClient();
                const clerkUser = await client.users.getUser(userId);

                if (clerkUser) {
                    const role = (clerkUser.publicMetadata?.userRole || clerkUser.unsafeMetadata?.userRole || 'CANDIDATE') as 'CLIENT' | 'CANDIDATE';
                    const email = clerkUser.emailAddresses[0]?.emailAddress;
                    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null;

                    if (email) {
                        dbUser = await prisma.user.upsert({
                            where: { clerkId: userId },
                            update: {
                                email,
                                name,
                                profileImageUrl: clerkUser.imageUrl,
                                userRole: role
                            },
                            create: {
                                clerkId: userId,
                                email,
                                name,
                                profileImageUrl: clerkUser.imageUrl,
                                userRole: role
                            }
                        });
                        console.log(`[API] Synced user ${userId} with role ${role}`);
                    }
                }
            } catch (error) {
                console.error('[API] Failed to sync user during auth check:', error);
            }
        }

        if (dbUser?.userRole !== 'CLIENT') {
            console.log(`[API] Forbidden - User ${userId} is not a company (Role: ${dbUser?.userRole})`);
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
        let whereClause: {
            companyId: string;
            status?: { in: ApplicationStatus[] } | ApplicationStatus;
            appliedAt?: { gte?: Date; lte?: Date };
        } = {
            companyId: userId
        };

        // Status mapping
        const statusMap: Record<string, ApplicationStatus[]> = {
            'Active': [ApplicationStatus.APPLIED, ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW],
            'Inactive': [ApplicationStatus.REJECTED, ApplicationStatus.HIRED],
            'Withdrawn': [ApplicationStatus.WITHDRAWN]
        };

        if (statusParam && statusMap[statusParam]) {
            whereClause.status = { in: statusMap[statusParam] };
        }

        // Date range filtering with validation
        if (fromDate || toDate) {
            whereClause.appliedAt = {};
            if (fromDate) {
                const date = new Date(fromDate);
                if (!isNaN(date.getTime())) {
                    whereClause.appliedAt.gte = date;
                } else {
                    return NextResponse.json({ error: "Invalid fromDate format" }, { status: 400 });
                }
            }
            if (toDate) {
                const date = new Date(toDate);
                if (!isNaN(date.getTime())) {
                    whereClause.appliedAt.lte = date;
                } else {
                    return NextResponse.json({ error: "Invalid toDate format" }, { status: 400 });
                }
            }
        }

        // 4. Handle Default Filtering Logic if no status filter is provided
        let applications: any[] = [];

        if (!statusParam) {
            // Requirement: "By default, show only Active applications... If there are no Active applications, then show Inactive, Withdrawn"
            const activeApps = await prisma.application.findMany({
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
                applications = await prisma.application.findMany({
                    where: {
                        ...whereClause,
                        status: { in: [...statusMap['Inactive'], ...statusMap['Withdrawn']] }
                    },
                    include: {
                        job: {
                            select: { id: true, title: true, category: true, employmentType: true, location: true, companyId: true }
                        }
                    },
                    orderBy: { appliedAt: 'desc' },
                    take: 50 // Unbounded query limit
                });
            }
        } else {
            // Fetch based on explicit status filter
            applications = await prisma.application.findMany({
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
                    const client = await clerkClient();
                    const clerkUser = await client.users.getUser(app.candidateId);

                    if (clerkUser) {
                        candidate = {
                            clerkId: clerkUser.id,
                            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || 'Anonymous Candidate',
                            email: clerkUser.emailAddresses[0]?.emailAddress || 'N/A',
                            profileImageUrl: clerkUser.imageUrl
                        };

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

    } catch (error) {
        console.error('[API] Error in GET /api/company/applications:', error);
        return NextResponse.json({
            error: "Failed to fetch applications",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
