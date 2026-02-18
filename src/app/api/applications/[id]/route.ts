import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * PATCH /api/applications/[id]
 * Withdraw an application
 * 🔒 SECURITY: Ensures application belongs to the candidate
 */
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

        // 🔒 SECURITY: Check if application exists and belongs to user
        const existingApp = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { candidateId: true }
        });

        if (!existingApp) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (existingApp.candidateId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (body.status === 'WITHDRAWN') {
            const updatedApp = await prisma.application.update({
                where: { id: applicationId },
                data: { status: 'WITHDRAWN' }
            });
            return NextResponse.json(updatedApp);
        }

        return NextResponse.json({ error: "Invalid status update. Only 'WITHDRAWN' is allowed." }, { status: 400 });

    } catch (error: any) {
        console.error("[API] Error withdrawing application:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
