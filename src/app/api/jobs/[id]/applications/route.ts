import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/jobs/[id]/applications
 * View all applications for a specific job
 * 🔒 SECURITY: Only the company that owns the job can view applications
 * 🔒 SECURITY: Double verification (job ownership + companyId filter)
 */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    console.log('[API] GET /api/jobs/[id]/applications - Request received for job:', params.id);

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

        // 3. 🔒 SECURITY: Verify job exists and belongs to this company
        const job = await prisma.job.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                title: true,
                companyId: true,
            }
        });

        if (!job) {
            console.log('[API] Job not found:', params.id);
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // 🔒 SECURITY: Verify job ownership
        if (job.companyId !== userId) {
            console.log(`[SECURITY] Unauthorized access attempt: Company ${userId} tried to access jobs for ${job.companyId}`);
            return NextResponse.json({
                error: "Forbidden - You can only view applications for your own jobs"
            }, { status: 403 });
        }

        // 4. 🔒 SECURITY: Fetch applications with DOUBLE verification
        // Filter by both jobId AND companyId for defense in depth
        const applications = await prisma.application.findMany({
            where: {
                jobId: params.id,
                companyId: userId  // ✅ Additional safety check
            },
            orderBy: { appliedAt: 'desc' }
        });

        console.log(`[API] Found ${applications.length} applications for job ${params.id}`);
        return NextResponse.json(applications);

    } catch (error: any) {
        console.error('[API] Error in GET /api/jobs/[id]/applications:', error);
        return NextResponse.json({
            error: "Failed to fetch applications",
            details: error.message
        }, { status: 500 });
    }
}
