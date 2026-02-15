import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

// Direct instantiation for debugging
const prisma = new PrismaClient();

export async function POST(req: Request) {
    console.log('[API] POST / api/applications - Request received');

    try {
        const { userId } = await auth();
        console.log('[API] User ID from auth:', userId);

        if (!userId) {
            console.log('[API] Unauthorized - no userId');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log("[API] Request body:", JSON.stringify(body, null, 2));

        const { jobId, resumeUrl, motivation, currentCTC, expectedCTC, noticePeriod, city } = body;

        // Validate required fields
        if (!jobId || !resumeUrl) {
            console.log('[API] Missing required fields:', { jobId, resumeUrl });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log('[API] Attempting to create application...');

        // Try to create the application directly without checking if job exists first
        try {
            const application = await prisma.application.create({
                data: {
                    job: {
                        connectOrCreate: {
                            where: { id: jobId },
                            create: {
                                id: jobId,
                                title: "Sample Job",
                                company: "Sample Company",
                                location: "Remote",
                                description: "Auto-generated placeholder job",
                                employmentType: "Full Time",
                                category: "Engineering",
                                skills: [],
                            }
                        }
                    },
                    candidateId: userId,
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

        } catch (prismaError: any) {
            console.error('[API] Prisma error:', {
                message: prismaError.message,
                code: prismaError.code,
                meta: prismaError.meta,
                stack: prismaError.stack
            });

            return NextResponse.json({
                error: "Database error",
                details: prismaError.message,
                code: prismaError.code
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
            details: error.message,
            type: error.name
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    console.log('[API] GET /api/applications - Request received');

    try {
        const { userId } = await auth();

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
            details: error.message
        }, { status: 500 });
    }
}
