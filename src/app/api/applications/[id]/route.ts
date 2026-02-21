import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { api500 } from '@/lib/apiError';

/**
 * PATCH /api/applications/[id]
 * Withdraw an application - only the candidate who applied
 */
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
        const body = await req.json();

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
            const currentApp = await prisma.application.findUnique({
                where: { id: applicationId },
                select: { status: true }
            });

            const terminalStates = ['REJECTED', 'ACCEPTED', 'HIRED', 'WITHDRAWN'];
            if (currentApp && terminalStates.includes(currentApp.status)) {
                return NextResponse.json(
                    { error: `Cannot withdraw application with status '${currentApp.status}'.` },
                    { status: 409 }
                );
            }

            const updatedApp = await prisma.application.update({
                where: { id: applicationId },
                data: { status: 'WITHDRAWN' }
            });
            return NextResponse.json(updatedApp);
        }

        return NextResponse.json({ error: "Invalid status update. Only 'WITHDRAWN' is allowed." }, { status: 400 });
    } catch (error) {
        return api500("Failed to withdraw application", "PATCH /api/applications/[id]", error);
    }
}
