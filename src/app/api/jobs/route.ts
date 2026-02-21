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

        const where: { status: 'ACTIVE'; employmentType?: { in: string[] }; category?: string } = { status: 'ACTIVE' };

        if (employmentTypeParam) {
            const types = employmentTypeParam.split(',').map(t => t.trim()).filter(Boolean);
            if (types.length > 0) {
                where.employmentType = { in: types };
            }
        }

        if (categoryParam && categoryParam !== 'All Categories') {
            where.category = categoryParam;
        }

        if (skillsParam?.trim()) {
            const term = skillsParam.trim().toLowerCase();
            // Match jobs that have at least one skill containing the search term
            const jobs = await prisma.job.findMany({
                where: { ...where, status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
                take: 100,
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
            const filtered = term
                ? jobs.filter(job => job.skills.some(s => s.toLowerCase().includes(term)))
                : jobs;
            return NextResponse.json(filtered.slice(0, 50));
        }

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
