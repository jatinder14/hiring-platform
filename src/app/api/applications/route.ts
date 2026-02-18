import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: Request) {
    console.log('[API] POST / api/applications - Request received');

    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        console.log('[API] User ID from auth:', userId);

        if (!userId) {
            console.log('[API] Unauthorized - no userId');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        // Request body parsed


        const { jobId, resumeUrl, motivation, currentCTC, expectedCTC, noticePeriod, city } = body;

        // Validate required fields
        if (!jobId || !resumeUrl) {
            console.log('[API] Missing required fields');
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log('[API] Attempting to create application...');

        // Try to create the application directly without checking if job exists first
        // Check if job exists first
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            console.log('[API] Job not found:', jobId);
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Check for existing application
        const existingApplication = await prisma.application.findFirst({
            where: {
                jobId: jobId,
                candidateId: userId
            }
        });

        if (existingApplication) {
            console.log('[API] Duplicate application attempt:', { jobId, userId });
            return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 });
        }

        try {
            const application = await prisma.application.create({
                data: {
                    job: {
                        connect: { id: jobId }
                    },
                    candidateId: userId,
                    resumeUrl: resumeUrl,
                    motivation: motivation ? JSON.stringify(motivation) : null,
                    currentCTC: currentCTC ?? null,
                    expectedCTC: expectedCTC ?? null,
                    noticePeriod: noticePeriod ?? null,
                    city: city ?? null,
                    status: "APPLIED"
                }
            });

            console.log('[API] Application created successfully:', application.id);
            return NextResponse.json(application, { status: 201 });

        } catch (prismaError: any) {
            console.error('[API] Prisma error:', {
                message: prismaError.message,
                code: prismaError.code,
                meta: prismaError.meta,
                stack: prismaError.stack
            });

            return NextResponse.json({
                error: "Database error",
                details: "An error occurred while saving your application."
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("[API] Unexpected error in POST /api/applications:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return NextResponse.json({
            error: "Failed to submit application",
            details: "An unexpected error occurred."
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    console.log('[API] GET /api/applications - Request received');

    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applications = await prisma.application.findMany({
            where: { candidateId: userId },
            include: { job: true },
            orderBy: { appliedAt: 'desc' }
        });

        console.log(`[API] Found ${applications.length} applications for user ${userId}`);
        return NextResponse.json(applications);

    } catch (error: any) {
        console.error("[API] Error in GET /api/applications:", error);
        return NextResponse.json({
            error: "Failed to fetch applications",
            details: "An error occurred while retrieving your applications."
        }, { status: 500 });
    }
}
