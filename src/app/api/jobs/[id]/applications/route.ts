import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { api500 } from '@/lib/apiError';

/**
 * GET /api/jobs/[id]/applications
 * View applications for a job - only company that owns the job
 */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id as string | undefined;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { userRole: true }
        });

        if (dbUser?.userRole !== UserRole.RECRUITER) {
            return NextResponse.json({
                error: "Forbidden - Only companies can view applications"
            }, { status: 403 });
        }

        const job = await prisma.job.findUnique({
            where: { id: params.id },
            select: { id: true, title: true, companyId: true }
        });

        if (!job || job.companyId !== userId) {
            return NextResponse.json({ error: "Forbidden - You can only view applications for your own jobs" }, { status: 403 });
        }

        const applications = await prisma.application.findMany({
            where: { jobId: params.id, companyId: userId },
            orderBy: { appliedAt: 'desc' },
            take: 50
        });

        return NextResponse.json(applications);
    } catch (error) {
        return api500("Failed to fetch applications", "GET /api/jobs/[id]/applications", error);
    }
}
