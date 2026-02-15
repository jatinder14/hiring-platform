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

        // 3. 🔒 SECURITY: Filter by companyId ONLY
        // This ensures Company A never sees Company B's applications
        console.log('[API] Fetching applications for companyId:', userId);

        // Usage of 'any' is required because Prisma client might be out of sync with schema
        const applications: any[] = await (prisma.application as any).findMany({
            where: {
                companyId: userId  // ✅ Direct filter by company
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        employmentType: true,
                        location: true,
                        companyId: true,  // For additional verification
                    }
                }
            },
            orderBy: { appliedAt: 'desc' }
        });

        // 4. 🔒 ADDITIONAL SECURITY: Verify all included jobs belong to this company
        // Defense in depth - ensures no data leaks even if DB relationships are broken
        const verified = applications.filter((app: any) =>
            app.job && app.job.companyId === userId
        );

        if (verified.length !== applications.length) {
            console.warn(
                `[SECURITY WARNING] Filtered out ${applications.length - verified.length} applications with mismatched companyId`
            );
        }

        // 5. Fetch Candidate Details
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

        const enrichedApplications = verified.map(app => ({
            ...app,
            candidate: candidateMap.get(app.candidateId) || { name: 'Unknown Candidate', email: 'N/A', profileImageUrl: null }
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
