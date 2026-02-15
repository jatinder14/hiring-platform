import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = params.id;

        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { applications: true }
                }
            }
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Verify ownership - Cast to any due to potential Prisma client sync issues
        if ((job as any).companyId !== userId && (job as any).postedById !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error("Error fetching job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = params.id;
        const body = await request.json();

        // Check ownership
        const existingJob = await prisma.job.findUnique({
            where: { id }
        });

        if (!existingJob) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if ((existingJob as any).companyId !== userId && (existingJob as any).postedById !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update - Cast data to any to bypass strict type checking
        const updateData: any = {
            title: body.title,
            location: body.location,
            description: body.description,
            employmentType: body.employmentType,
            salary: body.salary,
            status: body.status,
            category: body.category || (existingJob as any).category,
            skills: body.skills || (existingJob as any).skills,
            currency: body.currency || (existingJob as any).currency
        };

        const updatedJob = await prisma.job.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedJob);
    } catch (error) {
        console.error("Error updating job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = params.id;

        // Check ownership
        const existingJob = await prisma.job.findUnique({
            where: { id }
        });

        if (!existingJob) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if ((existingJob as any).companyId !== userId && (existingJob as any).postedById !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete related applications first (manual cascade for safety with MongoDB/Prisma)
        await prisma.application.deleteMany({
            where: { jobId: id }
        });

        // Delete job
        await prisma.job.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
