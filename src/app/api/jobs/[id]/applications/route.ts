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

        const PAGE_SIZE = 50;
        const applications = await prisma.application.findMany({
            where: { jobId: params.id, companyId: userId },
            orderBy: { appliedAt: 'desc' },
            take: PAGE_SIZE + 1,
            select: {
                id: true,
                candidateId: true,
                status: true,
                appliedAt: true,
                motivation: true,
                resumeUrl: true,
                interviewScheduledAt: true,
                currentCTC: true,
                expectedCTC: true,
                noticePeriod: true,
                city: true,
            }
        });

        const hasMore = applications.length > PAGE_SIZE;
        const data = applications.slice(0, PAGE_SIZE);
        return NextResponse.json({ data, hasMore });
    } catch (error) {
        return api500("Failed to fetch applications", "GET /api/jobs/[id]/applications", error);
    }
}
