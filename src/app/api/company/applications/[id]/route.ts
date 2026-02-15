import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applicationId = params.id;

        const application = await prisma.application.findUnique({
            where: {
                id: applicationId
            },
            include: {
                job: true
            }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.companyId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const candidate = await prisma.user.findUnique({
            where: {
                clerkId: application.candidateId
            },
            select: {
                name: true,
                email: true,
                profileImageUrl: true,
            }
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
        console.error('Error fetching application:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applicationId = params.id;
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        // Verify ownership first
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

        // Update status
        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: { status }
        });

        return NextResponse.json(updatedApplication);

    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
