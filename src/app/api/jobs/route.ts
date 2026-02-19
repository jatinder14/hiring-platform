import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { api500 } from '@/lib/apiError';

/**
 * POST /api/jobs
 * Create a new job posting
 * 🔒 SECURITY: Only companies (RECRUITER) can create jobs
 * 🔒 SECURITY: companyId comes from authenticated session (cannot be spoofed)
 */
export async function POST(req: Request) {
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
            return NextResponse.json({
                error: "Forbidden - Only companies can post jobs"
            }, { status: 403 });
        }

        const body = await req.json();
        const {
            title,
            company,
            location,
            description,
            employmentType,
            category,
            skills,
            salary,
            currency,
            status,
            country,
            state,
            city,
            pincode,
            workMode,
            experienceMin,
            experienceMax,
            requirements,
        } = body;

        if (!title || !company || !description || !employmentType || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const fullLocation = [city, state, country].filter(Boolean).join(', ') || location || 'Remote';

        const job = await prisma.job.create({
            data: {
                title,
                company,
                location: fullLocation,
                description,
                employmentType,
                category,
                skills: Array.isArray(skills) ? skills : [],
                salary,
                currency,
                companyId: userId,
                status: status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
                experienceMin: experienceMin != null && experienceMin !== '' ? parseInt(String(experienceMin), 10) : null,
                experienceMax: experienceMax != null && experienceMax !== '' ? parseInt(String(experienceMax), 10) : null,
            }
        });

        return NextResponse.json(job, { status: 201 });

    } catch (error) {
        return api500("Failed to create job", "POST /api/jobs", error);
    }
}

/**
 * GET /api/jobs
 * List all ACTIVE jobs (public)
 */
export async function GET(req: Request) {
    try {
        const where = { status: 'ACTIVE' as const };
        const jobs = await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
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
                status: true,
                createdAt: true,
                experienceMin: true,
                experienceMax: true,
            }
        });
        return NextResponse.json(jobs);
    } catch (error) {
        return api500("We're having trouble reaching the database. Please try again in a moment.", "GET /api/jobs", error);
    }
}
