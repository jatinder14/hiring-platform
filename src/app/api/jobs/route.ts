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

        // 2. Authorization check - Always validate against DB for security
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        // 🛡️ DATA RECOVERY: If user missing or role mismatch, try strict sync from Clerk
        if (!dbUser || dbUser.userRole !== 'CLIENT') {
            console.log('[API] User missing or role mismatch in DB, attempting sync from Clerk...');
            try {
                const { clerkClient } = await import('@clerk/nextjs/server');
                const client = await clerkClient();
                const clerkUser = await client.users.getUser(userId);

                if (clerkUser) {
                    const role = (clerkUser.publicMetadata?.userRole || clerkUser.unsafeMetadata?.userRole || 'CANDIDATE') as 'CLIENT' | 'CANDIDATE';
                    const email = clerkUser.emailAddresses[0]?.emailAddress;
                    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null;

                    if (email) {
                        dbUser = await prisma.user.upsert({
                            where: { clerkId: userId },
                            update: {
                                email,
                                name,
                                profileImageUrl: clerkUser.imageUrl,
                                userRole: role
                            },
                            create: {
                                clerkId: userId,
                                email,
                                name,
                                profileImageUrl: clerkUser.imageUrl,
                                userRole: role
                            }
                        });
                        console.log(`[API] Synced user ${userId} with role ${role}`);
                    }
                }
            } catch (error) {
                console.error('[API] Failed to sync user during auth check:', error);
            }
        }

        if (dbUser?.userRole !== 'CLIENT') {
            console.log(`[API] Forbidden - User ${userId} is not a company (Role: ${dbUser?.userRole})`);
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
                experienceMin: experienceMin ? parseInt(experienceMin) : null,
                experienceMax: experienceMax ? parseInt(experienceMax) : null,
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
    console.log('[API] GET /api/jobs - Fetching jobs...');

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        // Build where clause
        const where: any = {};

        // 🔒 SECURITY: Strictly enforce ACTIVE status for public listings
        // Ignore any status query param - only show ACTIVE jobs to the public
        where.status = 'ACTIVE';

        // Fetch jobs with comprehensive error handling
        const jobs = await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            // Select only what's needed for public view
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

        console.log(`[API] Successfully fetched ${jobs.length} jobs`);
        return NextResponse.json(jobs);

    } catch (error: any) {
        console.error('[API] Critical error in GET /api/jobs:', error);
        return NextResponse.json({
            error: "We're having trouble reaching the database. Please try again in a moment.",
            details: error.message
        }, { status: 500 });
    }
}
