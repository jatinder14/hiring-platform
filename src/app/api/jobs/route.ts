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
 * List all ACTIVE jobs (public). Supports server-side filtering via query params.
 * - employmentType: comma-separated (e.g. "Full-time,Contract,Internship")
 * - category: single value (e.g. "Engineering")
 * - skills: substring match (e.g. "React")
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const employmentTypeParam = searchParams.get('employmentType');
        const categoryParam = searchParams.get('category');
        const skillsParam = searchParams.get('skills');

        const where: {
            status: 'ACTIVE';
            employmentType?: { in: string[] };
            category?: string;
            skills?: { hasSome: string[] } | { has: string };
        } = { status: 'ACTIVE' };

        if (employmentTypeParam) {
            const types = employmentTypeParam.split(',').map(t => t.trim()).filter(Boolean);
            if (types.length > 0) {
                where.employmentType = { in: types };
            }
        }

        if (categoryParam && categoryParam !== 'All Categories') {
            where.category = categoryParam;
        }

        // Push skills filtering to the database using Prisma's array operators.
        // `hasSome` performs a case-sensitive exact-element match at the DB level,
        // avoiding the previous pattern of fetching 100 rows and filtering in-memory.
        // For case-insensitive substring matching a full-text search index would be ideal,
        // but hasSome covers the common "exact skill tag" use-case efficiently.
        if (skillsParam?.trim()) {
            const term = skillsParam.trim();
            where.skills = { hasSome: [term] };
        }

        const jobSelect = {
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
        };

        const jobs = await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: jobSelect,
        });
        return NextResponse.json(jobs);
    } catch (error) {
        return api500("We're having trouble reaching the database. Please try again in a moment.", "GET /api/jobs", error);
    }
}
