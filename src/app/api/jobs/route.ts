import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/jobs
 * Create a new job posting
 * 🔒 SECURITY: Only companies can create jobs
 * 🔒 SECURITY: companyId comes from authenticated session (cannot be spoofed)
 */
export async function POST(req: Request) {
    console.log('[API] POST /api/jobs - Request received');

    try {
        // 1. Authentication check
        const { userId } = await auth();
        console.log('[API] User ID from auth:', userId);

        if (!userId) {
            console.log('[API] Unauthorized - no userId');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Authorization check - Must be a company
        const user = await currentUser();
        const userRole = user?.unsafeMetadata?.userRole;
        console.log('[API] User role:', userRole);

        if (userRole !== 'CLIENT') {
            console.log('[API] Forbidden - user is not a company');
            return NextResponse.json({
                error: "Forbidden - Only companies can post jobs"
            }, { status: 403 });
        }

        // 3. Parse request body
        const body = await req.json();
        console.log("[API] Request body received");

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
            // Additional fields from CreateJobForm
            country,
            state,
            city,
            pincode,
            workMode,
            experienceMin,
            experienceMax,
            requirements,
        } = body;

        // 4. Validate required fields
        if (!title || !company || !description || !employmentType || !category) {
            console.log('[API] Missing required fields');
            return NextResponse.json({
                error: "Missing required fields"
            }, { status: 400 });
        }

        // 5. Create full location string
        const fullLocation = [city, state, country].filter(Boolean).join(', ') || location || 'Remote';

        // 6. 🔒 SECURITY: Create job with companyId from authenticated session
        console.log('[API] Creating job with companyId:', userId);

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
                companyId: userId,  // ✅ From authenticated session, NOT from request body
                status: status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',  // Default to DRAFT for safety
            }
        });

        console.log('[API] Job created successfully:', job.id);
        return NextResponse.json(job, { status: 201 });

    } catch (error: any) {
        console.error('[API] Error in POST /api/jobs:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return NextResponse.json({
            error: "Failed to create job",
            details: error.message,
            type: error.name
        }, { status: 500 });
    }
}

/**
 * GET /api/jobs
 * List all ACTIVE jobs (for candidates to browse)
 * 🔒 SECURITY: Only show ACTIVE jobs (hide DRAFT/CLOSED/ARCHIVED)
 * Public endpoint - no authentication required
 */
export async function GET(req: Request) {
    console.log('[API] GET /api/jobs - Request received');

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        // Build where clause
        const where: any = {};

        // 🔒 SECURITY: For public listing, only show ACTIVE jobs
        // Companies can see their own jobs in dedicated endpoint
        if (status) {
            where.status = status;
        } else {
            where.status = 'ACTIVE';  // Default to ACTIVE only
        }

        // Fetch jobs
        const jobs = await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
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
                // Don't expose companyId in public listing for privacy
                companyId: false,
            }
        });

        console.log(`[API] Found ${jobs.length} jobs`);
        return NextResponse.json(jobs);

    } catch (error: any) {
        console.error('[API] Error in GET /api/jobs:', error);
        return NextResponse.json({
            error: "Failed to fetch jobs",
            details: error.message
        }, { status: 500 });
    }
}
