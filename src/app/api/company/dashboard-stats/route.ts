import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parallel fetching for performance
        const [jobs, applications] = await Promise.all([
            prisma.job.findMany({
                where: { companyId: userId },
                select: { status: true }
            }),
            prisma.application.findMany({
                where: { companyId: userId },
                include: {
                    job: {
                        select: { title: true }
                    }
                },
                orderBy: { appliedAt: 'desc' },
                take: 50
            })
        ]);

        // Fetch candidate details manually as they are not defined in the relation
        const candidateIds = Array.from(new Set(applications.map(a => a.candidateId)));
        const candidates = await prisma.user.findMany({
            where: { clerkId: { in: candidateIds } },
            select: { clerkId: true, name: true }
        });

        const candidateMap = new Map(candidates.map(c => [c.clerkId, c]));

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
        console.error("[API] Error fetching dashboard stats:", error);
        return NextResponse.json({
            error: "Failed to fetch dashboard stats",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
