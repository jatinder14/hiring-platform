import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        const job = await prisma.job.findUnique({
            where: {
                id: id
            }
        });

        if (!job || job.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error('Error fetching job details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job details' },
            { status: 500 }
        );
    }
}
