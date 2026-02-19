import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { api500 } from '@/lib/apiError';
import { ApplicationStatus } from '@prisma/client';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id as string | undefined;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applicationId = params.id;
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.companyId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const candidate = await prisma.user.findUnique({
            where: { id: application.candidateId },
            select: { id: true, name: true, email: true, profileImageUrl: true }
        });

        const responseData = {
            ...application,
            candidate: candidate || {
                name: 'Unknown Candidate',
                email: 'N/A',
                profileImageUrl: null
            }
        };

        return NextResponse.json(responseData);
    } catch (error) {
        return api500("Failed to fetch application", "GET /api/company/applications/[id]", error);
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id as string | undefined;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applicationId = params.id;
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { companyId: true }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.companyId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { status, interviewScheduledAt } = body;

        const allowedStatuses = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED'];

        if (!status || !allowedStatuses.includes(status)) {
            return NextResponse.json({
                error: "Invalid status value or unauthorized transition",
                allowed: allowedStatuses
            }, { status: 400 });
        }

        const updateData: { status: ApplicationStatus; interviewScheduledAt?: Date } = { status: status as ApplicationStatus };
        if (interviewScheduledAt) {
            updateData.interviewScheduledAt = new Date(interviewScheduledAt);
        }

        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: updateData
        });

        return NextResponse.json(updatedApplication);
    } catch (error) {
        return api500("Failed to update application", "PATCH /api/company/applications/[id]", error);
    }
}
