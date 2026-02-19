import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApplicationStatus, UserRole } from '@prisma/client';
import { api500 } from '@/lib/apiError';

/**
 * GET /api/company/applications
 * Fetch ALL applications for the authenticated company
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

        const { searchParams } = new URL(req.url);
        const statusParam = searchParams.get('status');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');

        let whereClause: {
            companyId: string;
            status?: { in: ApplicationStatus[] } | ApplicationStatus;
            appliedAt?: { gte?: Date; lte?: Date };
        } = { companyId: userId };

        const statusMap: Record<string, ApplicationStatus[]> = {
            'Active': [ApplicationStatus.APPLIED, ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW],
            'Inactive': [ApplicationStatus.REJECTED, ApplicationStatus.HIRED],
            'Withdrawn': [ApplicationStatus.WITHDRAWN]
        };

        if (statusParam && statusMap[statusParam]) {
            whereClause.status = { in: statusMap[statusParam] };
        }

        if (fromDate || toDate) {
            whereClause.appliedAt = {};
            if (fromDate) {
                const date = new Date(fromDate);
                if (!isNaN(date.getTime())) whereClause.appliedAt.gte = date;
                else return NextResponse.json({ error: "Invalid fromDate format" }, { status: 400 });
            }
            if (toDate) {
                const date = new Date(toDate);
                if (!isNaN(date.getTime())) whereClause.appliedAt.lte = date;
                else return NextResponse.json({ error: "Invalid toDate format" }, { status: 400 });
            }
        }

        type AppWithJob = { candidateId: string; job: { id: string; title: string; category: string; employmentType: string; location: string; companyId: string } | null };
        let applications: AppWithJob[] = [];

        if (!statusParam) {
            const activeApps = await prisma.application.findMany({
                where: { ...whereClause, status: { in: statusMap['Active'] } },
                include: {
                    job: {
                        select: { id: true, title: true, category: true, employmentType: true, location: true, companyId: true }
                    }
                },
                orderBy: { appliedAt: 'desc' }
            });

            if (activeApps.length > 0) {
                applications = activeApps as AppWithJob[];
            } else {
                applications = (await prisma.application.findMany({
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
                    take: 50
                })) as AppWithJob[];
            }
        } else {
            applications = (await prisma.application.findMany({
                where: whereClause,
                include: {
                    job: {
                        select: { id: true, title: true, category: true, employmentType: true, location: true, companyId: true }
                    }
                },
                orderBy: { appliedAt: 'desc' }
            })) as AppWithJob[];
        }

        const verified = applications.filter((app) => app.job && app.job.companyId === userId);
        const candidateIds = Array.from(new Set(verified.map((app) => app.candidateId)));

        const candidates = await prisma.user.findMany({
            where: { id: { in: candidateIds } },
            select: { id: true, name: true, email: true, profileImageUrl: true }
        });

        const candidateMap = new Map(candidates.map(c => [c.id, c]));

        const enrichedApplications = verified.map((app) => {
            const candidate = candidateMap.get(app.candidateId);
            return {
                ...app,
                candidate: candidate || { name: 'Unknown Candidate', email: 'N/A', profileImageUrl: null }
            };
        });

        return NextResponse.json(enrichedApplications);
    } catch (error) {
        return api500("Failed to fetch applications", "GET /api/company/applications", error);
    }
}
