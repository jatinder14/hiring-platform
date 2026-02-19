import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { api500 } from '@/lib/apiError';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id as string | undefined;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [jobs, applications] = await Promise.all([
            prisma.job.findMany({
                where: { companyId: userId },
                select: { status: true }
            }),
            prisma.application.findMany({
                where: { companyId: userId },
                include: {
                    job: { select: { title: true } }
                },
                orderBy: { appliedAt: 'desc' },
                take: 50
            })
        ]);

        const candidateIds = Array.from(new Set(applications.map(a => a.candidateId)));
        const candidates = await prisma.user.findMany({
            where: { id: { in: candidateIds } },
            select: { id: true, name: true }
        });

        const candidateMap = new Map(candidates.map(c => [c.id, c]));

        const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
        const totalApplications = applications.length;
        const uniqueCandidates = candidateIds.length;
        const interviewCount = applications.filter(a => ['INTERVIEW', 'Interview'].includes(a.status)).length;

        const recentActivity = applications.slice(0, 5).map(app => {
            const candidate = candidateMap.get(app.candidateId);
            return {
                id: app.id,
                type: 'APPLICATION',
                user: candidate?.name || 'A candidate',
                role: app.job?.title || 'a job',
                time: app.appliedAt.toISOString()
            };
        });

        return NextResponse.json({
            stats: {
                activeJobs,
                totalCandidates: uniqueCandidates,
                totalApplications,
                interviews: interviewCount
            },
            recentActivity
        });
    } catch (error) {
        return api500("Failed to fetch dashboard stats", "GET /api/company/dashboard-stats", error);
    }
}
