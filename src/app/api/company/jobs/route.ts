import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/company/jobs
 * List all jobs for the authenticated company
 * Includes counts of applicants
 */
export async function GET(req: Request) {
    try {
        // 1. Authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Authorization check - Always validate against DB for security
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (dbUser?.userRole !== 'CLIENT') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Fetch jobs
        const jobs = await prisma.job.findMany({
            where: {
                companyId: userId
            },
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Unbounded query limit
        });

        // 4. Format response
        const formattedJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            location: job.location,
            type: job.employmentType,
            applicants: job._count.applications,
            status: job.status, // ACTIVE, DRAFT, CLOSED, ARCHIVED
            postedDate: job.createdAt
        }));

        return NextResponse.json(formattedJobs);
    } catch (error: any) {
        console.error('Error fetching company jobs:', error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}
