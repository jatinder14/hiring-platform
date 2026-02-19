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

        let candidate = await prisma.user.findUnique({
            where: {
                clerkId: application.candidateId
            },
            select: {
                clerkId: true,
                name: true,
                email: true,
                profileImageUrl: true,
            }
        });

        // 🛡️ DATA RECOVERY: If candidate missing from DB, fetch from Clerk
        if (!candidate) {
            console.log(`[API] Candidate ${application.candidateId} missing from local DB, fetching from Clerk...`);
            try {
                const { clerkClient } = await import('@clerk/nextjs/server');
                const client = await clerkClient();
                const clerkUser = await client.users.getUser(application.candidateId);

                if (clerkUser) {
                    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || 'Anonymous Candidate';
                    const email = clerkUser.emailAddresses[0]?.emailAddress;

                    candidate = {
                        clerkId: clerkUser.id,
                        name,
                        email: email || 'N/A',
                        profileImageUrl: clerkUser.imageUrl
                    };

                    // Only sync to DB if we have an email (required field in our schema)
                    if (email) {
                        await prisma.user.upsert({
                            where: { clerkId: clerkUser.id },
                            update: {
                                name: candidate.name,
                                email: email,
                                profileImageUrl: candidate.profileImageUrl
                            },
                            create: {
                                clerkId: clerkUser.id,
                                name: candidate.name,
                                email: email,
                                profileImageUrl: candidate.profileImageUrl,
                                userRole: 'CANDIDATE'
                            }
                        }).catch(e => console.error('[API] Auto-sync failed:', e));
                    } else {
                        console.warn(`[API] Skipping sync for candidate ${clerkUser.id} due to missing email`);
                    }
                }
            } catch (clerkError) {
                console.error(`[API] Failed to fetch candidate ${application.candidateId} from Clerk:`, clerkError);
            }
        }

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

        // Verify ownership first
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { companyId: true }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.companyId !== userId) {
            return NextResponse.json({ error: "Forbidden - Not your application" }, { status: 403 });
        }

        const body = await req.json();
        const { status, interviewScheduledAt } = body;

        // 🛡️ DATA VALIDATION: Validate status against authorized company transitions
        const allowedStatuses = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED'];

        if (!status || !allowedStatuses.includes(status)) {
            return NextResponse.json({
                error: "Invalid status value or unauthorized transition",
                allowed: allowedStatuses
            }, { status: 400 });
        }

        const updateData: any = { status };
        if (interviewScheduledAt) {
            updateData.interviewScheduledAt = new Date(interviewScheduledAt);
        }

        // Update status
        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: updateData
        });

        return NextResponse.json(updatedApplication);

    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
