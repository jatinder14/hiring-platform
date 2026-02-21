import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { api500 } from "@/lib/apiError";
import { ApplicationStatus, UserRole } from "@prisma/client";

/**
 * POST /api/applications
 * Submit a job application
 * 🔒 SECURITY: Verifies job exists and is ACTIVE
 * 🔒 SECURITY: Gets companyId from job (not from request body)
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { userRole: true }
        });
        if (dbUser?.userRole !== UserRole.CANDIDATE) {
            return NextResponse.json({ error: "Only candidates can apply" }, { status: 403 });
        }

        // 2. Parse request body
        interface ApplicationBody {
            jobId?: string;
            resumeUrl?: string;
            motivation?: string | null;
            currentCTC?: string | null;
            expectedCTC?: string | null;
            currentCurrency?: string | null;
            expectedCurrency?: string | null;
            noticePeriod?: string | null;
            city?: string | null;
        }
        let body: ApplicationBody;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { jobId, resumeUrl, motivation, currentCTC, expectedCTC, currentCurrency, expectedCurrency, noticePeriod, city } = body;

        // 3. Validate required fields
        if (!jobId || !resumeUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 🛡️ SECURITY: Prevent Stored XSS by validating URL protocol
        try {
            const url = new URL(resumeUrl);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new Error("Invalid protocol");
            }
        } catch (e) {
            return NextResponse.json({
                error: "Invalid resume URL. Only http:// and https:// links are allowed for security reasons."
            }, { status: 400 });
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
                motivation: motivation ?? null,
                currentCTC: currentCTC ?? null,
                expectedCTC: expectedCTC ?? null,
                currentCurrency: currentCurrency ?? null,
                expectedCurrency: expectedCurrency ?? null,
                noticePeriod: noticePeriod ?? null,
                city: city ?? null,
                status: ApplicationStatus.APPLIED,
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
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

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
                        salary: true,
                        currency: true,
                        experienceMin: true,
                        experienceMax: true
                    }
                }
            },
            orderBy: { appliedAt: 'desc' }
        });

        return NextResponse.json(applications);

    } catch (error) {
        return api500("Failed to fetch applications", "GET /api/applications", error);
    }
}
