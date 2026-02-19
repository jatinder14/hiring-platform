import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
    logger.info('[API] POST / api/applications - Request received');

    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        logger.info('[API] User ID from auth:', userId);

        if (!userId) {
            logger.warn('[API] Unauthorized - no userId');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        // Request body parsed


        const { jobId, resumeUrl, motivation, currentCTC, expectedCTC, noticePeriod, city } = body;

        // Validate required fields
        if (!jobId || !resumeUrl) {
            logger.warn('[API] Missing required fields');
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        logger.info('[API] Attempting to create application...');

        // Check if job exists first
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            logger.error('[API] Job not found:', jobId);
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
            logger.warn('[API] Duplicate application attempt:', { jobId, userId });
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

            logger.info('[API] Application created successfully:', application.id);
            return NextResponse.json(application, { status: 201 });

        } catch (prismaError: any) {
            logger.error('[API] Prisma error:', {
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
        logger.error("[API] Unexpected error in POST /api/applications:", {
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
    logger.info('[API] GET /api/applications - Request received');

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

        logger.info(`[API] Found ${applications.length} applications for user ${userId}`);
        return NextResponse.json(applications);

    } catch (error: any) {
        logger.error("[API] Error in GET /api/applications:", error);
        return NextResponse.json({
            error: "Failed to fetch applications",
            details: "An error occurred while retrieving your applications."
        }, { status: 500 });
    }
}
