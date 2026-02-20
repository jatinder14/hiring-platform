import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { api500 } from "@/lib/apiError";
import { ApplicationStatus, UserRole } from "@prisma/client";

/**
 * Helper to get authenticated user ID reliably
 */
async function getAuthUserId(req: Request) {
    try {
        // 1. Try Server Session (Recommended)
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            return session.user.id;
        }

        // 2. Try JWT Token directly (Fallback)
        const token = await getToken({ req: req as any });
        if (token?.id) {
            return token.id as string;
        }
    } catch (e) {
        console.error("Auth check failed:", e);
    }
    return null;
}

/**
 * POST /api/applications
 * Submit a job application
 * 🔒 SECURITY: Verifies job exists and is ACTIVE
 * 🔒 SECURITY: Gets companyId from job (not from request body)
 */
export async function POST(req: Request) {
    try {
        let userId = await getAuthUserId(req);

        // DEV MODE FALLBACK: If auth fails locally, try to find a candidate to attribute it to
        // Remove this in production!
        if (!userId && process.env.NODE_ENV === 'development') {
            console.warn("⚠️  AUTH FAILED: Attempting Dev Fallback");
            const devUser = await prisma.user.findFirst({
                where: { userRole: 'CANDIDATE' }
            });
            if (devUser) {
                userId = devUser.id;
                console.warn(`⚠️  USING DEV FALLBACK USER: ${devUser.email} (${userId})`);
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - Please sign in again" }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { userRole: true }
        });

        if (dbUser?.userRole !== UserRole.CANDIDATE) {
            // Allow if strictly for dev testing, but normally enforce role
            if (process.env.NODE_ENV !== 'development') {
                return NextResponse.json({ error: "Only candidates can apply" }, { status: 403 });
            }
        }

        // 2. Parse request body
        const body = await req.json();

        const { jobId, resumeUrl, motivation, currentCTC, expectedCTC, currentCurrency, expectedCurrency, noticePeriod, city } = body;

        // 3. Validate required fields
        if (!jobId || !resumeUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 🛡️ SECURITY: Prevent Stored XSS by validating URL protocol
        try {
            const url = new URL(resumeUrl);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                // Determine if it's a relative URL (upload)
                if (!resumeUrl.startsWith('/uploads/')) {
                    throw new Error("Invalid protocol");
                }
            }
        } catch (e) {
            // Allow relative paths for uploads
            if (!resumeUrl.startsWith('/uploads/')) {
                return NextResponse.json({
                    error: "Invalid resume URL. Only http://, https://, or /uploads/ links are allowed."
                }, { status: 400 });
            }
        }

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
            return NextResponse.json({
                error: "Job not found"
            }, { status: 404 });
        }

        // 🔒 SECURITY: Only allow applications to ACTIVE jobs
        if (job.status !== 'ACTIVE') {
            return NextResponse.json({
                error: `This job is not accepting applications (Status: ${job.status})`
            }, { status: 400 });
        }

        // 6. Check if user already applied to this job
        const existingApplication = await prisma.application.findFirst({
            where: {
                jobId: jobId,
                candidateId: userId
            }
        });

        if (existingApplication) {
            return NextResponse.json({
                error: "You have already applied to this job"
            }, { status: 400 });
        }

        // 6. 🔒 SECURITY: Create application with companyId from job
        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId: userId,
                companyId: job.companyId,
                resumeUrl,
                motivation: motivation || null,
                currentCTC: currentCTC || null,
                expectedCTC: expectedCTC || null,
                currentCurrency: currentCurrency || null,
                expectedCurrency: expectedCurrency || null,
                noticePeriod: noticePeriod || null,
                city: city || null,
                status: "APPLIED",
            }
        });

        return NextResponse.json(application, { status: 201 });

    } catch (error) {
        return api500("Failed to submit application", "POST /api/applications", error);
    }
}

/**
 * GET /api/applications
 * Get all applications for the authenticated candidate
 */
export async function GET(req: Request) {
    try {
        let userId = await getAuthUserId(req);

        if (!userId && process.env.NODE_ENV === 'development') {
            const devUser = await prisma.user.findFirst({ where: { userRole: 'CANDIDATE' } });
            if (devUser) userId = devUser.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get("status")?.toUpperCase();

        const allowed: ApplicationStatus[] = ["APPLIED", "SHORTLISTED", "REJECTED", "INTERVIEW", "HIRED", "WITHDRAWN"];
        const query: { candidateId: string; status?: ApplicationStatus } = { candidateId: userId };
        if (statusFilter && allowed.includes(statusFilter as ApplicationStatus)) {
            query.status = statusFilter as ApplicationStatus;
        }

        const applications = await prisma.application.findMany({
            where: query,
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        location: true,
                        employmentType: true,
                        category: true,
                        skills: true,
                        salary: true,
                        currency: true,
                        experienceMin: true,
                        experienceMax: true,
                        description: true,
                        status: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: { appliedAt: 'desc' }
        });

        return NextResponse.json(applications);

    } catch (error) {
        console.error("GET /api/applications error:", error);
        return api500("Failed to fetch applications", "GET /api/applications", error);
    }
}
