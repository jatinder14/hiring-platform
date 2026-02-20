import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { api500 } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/[id]
 * Public job details - returns all fields needed for job detail view
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const job = await prisma.job.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                description: true,
                employmentType: true,
                category: true,
                skills: true,
                salary: true,
                currency: true,
                experienceMin: true,
                experienceMax: true,
                status: true,
                createdAt: true,
            }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Return job even if CLOSED/ARCHIVED so applicants can still view their applied job
        return NextResponse.json(job);
    } catch (error) {
        return api500("Failed to fetch job details", "GET /api/jobs/[id]", error);
    }
}
