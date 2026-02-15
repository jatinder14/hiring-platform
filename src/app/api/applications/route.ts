import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/applications
 * Submit a job application
 * 🔒 SECURITY: Verifies job exists and is ACTIVE
 * 🔒 SECURITY: Gets companyId from job (not from request body)
 */
export async function POST(req: Request) {
    console.log('[API] POST /api/applications - Request received');

    try {
        // 1. Authentication check
        const { userId } = await auth();
        console.log('[API] User ID from auth:', userId);

        if (!userId) {
            console.log('[API] Unauthorized - no userId');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse request body
        const body = await req.json();
        console.log("[API] Request body received");

        const { jobId, resumeUrl, motivation, currentCTC, expectedCTC, noticePeriod, city } = body;

        // 3. Validate required fields
        if (!jobId || !resumeUrl) {
            console.log('[API] Missing required fields:', { jobId, resumeUrl });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log('[API] Attempting to create application for jobId:', jobId);

        // 4. 🔒 SECURITY: Verify job exists and is ACTIVE
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: {
                id: true,
                companyId: true,
                status: true,
                title: true,
            }
        });

        if (!job) {
            console.log('[API] Job not found:', jobId);
            return NextResponse.json({
                error: "Job not found"
            }, { status: 404 });
        }

        // 🔒 SECURITY: Only allow applications to ACTIVE jobs
        if (job.status !== 'ACTIVE') {
            console.log('[API] Job is not accepting applications. Status:', job.status);
            return NextResponse.json({
                error: `This job is not accepting applications (Status: ${job.status})`
            }, { status: 400 });
        }

        // 5. Check if user already applied to this job
        const existingApplication = await prisma.application.findFirst({
            where: {
                jobId: jobId,
                candidateId: userId
            }
        });

        if (existingApplication) {
            console.log('[API] User already applied to this job');
            return NextResponse.json({
                error: "You have already applied to this job"
            }, { status: 400 });
        }

        // 6. 🔒 SECURITY: Create application with companyId from job
        const application = await prisma.application.create({
            data: {
                jobId: jobId,
                candidateId: userId,
                companyId: job.companyId,  // ✅ Get from job, NOT from request body
                resumeUrl: resumeUrl,
                motivation: motivation ? JSON.stringify(motivation) : null,
                currentCTC: currentCTC || null,
                expectedCTC: expectedCTC || null,
                noticePeriod: noticePeriod || null,
                city: city || null,
                status: "APPLIED"
            }
        });

        console.log('[API] Application created successfully:', application.id);
        return NextResponse.json(application, { status: 201 });

    } catch (error: any) {
        console.error('[API] Error in POST /api/applications:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return NextResponse.json({
            error: "Failed to submit application",
            details: error.message,
            type: error.name
        }, { status: 500 });
    }
}

/**
 * GET /api/applications
 * Get all applications for the authenticated candidate
 */
export async function GET(req: Request) {
    console.log('[API] GET /api/applications - Request received');

    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applications = await prisma.application.findMany({
            where: { candidateId: userId },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        location: true,
                        employmentType: true,
                        category: true,
                        salary: true,
                        currency: true,
                    }
                }
            },
            orderBy: { appliedAt: 'desc' }
        });

        console.log(`[API] Found ${applications.length} applications for user ${userId}`);
        return NextResponse.json(applications);

    } catch (error: any) {
        console.error("[API] Error in GET /api/applications:", error);
        return NextResponse.json({
            error: "Failed to fetch applications",
            details: error.message
        }, { status: 500 });
    }
}
