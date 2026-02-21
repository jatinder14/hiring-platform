import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { api500 } from '@/lib/apiError';
import { UserRole } from '@prisma/client';

/**
 * GET /api/company/jobs
 * List all jobs for the authenticated company
 */
export async function GET(req: Request) {
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
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const jobs = await prisma.job.findMany({
            where: { companyId: userId },
            include: { _count: { select: { applications: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const formattedJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            location: job.location,
            type: job.employmentType,
            applicants: job._count.applications,
            status: job.status,
            postedDate: job.createdAt
        }));

        return NextResponse.json(formattedJobs);
    } catch (error) {
        return api500("Failed to fetch jobs", "GET /api/company/jobs", error);
    }
}
