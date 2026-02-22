import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserRole } from '@prisma/client';
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

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { userRole: true }
        });
        if (!dbUser || dbUser.userRole !== UserRole.RECRUITER) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const [jobs, applicationsForActivity, totalApplications, uniqueCandidatesCount, interviewCount] = await Promise.all([
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
            }),
            prisma.application.count({ where: { companyId: userId } }),
            prisma.application.groupBy({
                by: ['candidateId'],
                where: { companyId: userId }
            }).then(g => g.length),
            prisma.application.count({
                where: { companyId: userId, status: 'INTERVIEW' }
            })
        ]);

        const candidateIds = Array.from(new Set(applicationsForActivity.map(a => a.candidateId)));
        const candidates = await prisma.user.findMany({
            where: { id: { in: candidateIds } },
            select: { id: true, name: true }
        });

        const candidateMap = new Map(candidates.map(c => [c.id, c]));

        const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;

        const recentActivity = applicationsForActivity.slice(0, 5).map(app => {
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
                totalCandidates: uniqueCandidatesCount,
                totalApplications,
                interviews: interviewCount
            },
            recentActivity
        });
    } catch (error) {
        return api500("Failed to fetch dashboard stats", "GET /api/company/dashboard-stats", error);
    }
}
