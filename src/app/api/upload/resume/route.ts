import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { api500 } from '@/lib/apiError';
import {
    getResumesBucket,
    RESUME_UPLOAD,
    parseResumeObjectNameFromUrl,
    getPublicResumeUrl,
} from '@/lib/gcs';

const SANITIZE_REGEX = /[^a-zA-Z0-9._-]/g;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'Missing or invalid file' }, { status: 400 });
        }

        if (file.type !== RESUME_UPLOAD.ALLOWED_MIME) {
            return NextResponse.json(
                { error: 'Only PDF files are allowed' },
                { status: 400 }
            );
        }
        if (file.size > RESUME_UPLOAD.MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${RESUME_UPLOAD.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { resumeUrl: true },
        });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const bucket = getResumesBucket();
        const oldObjectName = parseResumeObjectNameFromUrl(user.resumeUrl ?? undefined);
        if (oldObjectName) {
            try {
                await bucket.file(oldObjectName).delete({ ignoreNotFound: true });
            } catch (delErr) {
                console.error('[upload/resume] Failed to delete old object:', delErr);
                // Continue; we can still upload the new one
            }
        }

        const safeName = file.name.replace(SANITIZE_REGEX, '_').slice(0, 80) || 'resume.pdf';
        const timestamp = Date.now();
        const objectName = `resumes/${userId}/${timestamp}-${safeName}`;
        const blob = bucket.file(objectName);

        const buffer = Buffer.from(await file.arrayBuffer());
        await blob.save(buffer, {
            contentType: RESUME_UPLOAD.ALLOWED_MIME,
            metadata: { cacheControl: 'private, max-age=86400' },
        });

        try {
            await blob.makePublic();
        } catch (makePublicErr) {
            console.error('[upload/resume] makePublic failed (bucket may need uniform access):', makePublicErr);
            // Still return URL; bucket might already be public or use IAM
        }

        const resumeUrl = getPublicResumeUrl(objectName);

        await prisma.user.update({
            where: { id: userId },
            data: { resumeUrl },
        });

        return NextResponse.json({ resumeUrl });
    } catch (error) {
        const err = error as { code?: number; error?: { code?: number; message?: string }; message?: string } | null;
        const code = err?.code ?? err?.error?.code;
        const message = typeof err?.message === 'string' ? err.message : String(err?.error?.message ?? '');
        const isGcsForbidden =
            code === 403 ||
            message.includes('storage.objects.create') ||
            (message.includes('403') && message.toLowerCase().includes('permission'));
        if (isGcsForbidden) {
            console.error('[API] POST /api/upload/resume: GCS permission denied', error);
            return NextResponse.json(
                {
                    error:
                        'Resume upload is unavailable: storage permission denied. Please ensure the service account has Storage Object Creator (or Object Admin) on the bucket.',
                },
                { status: 503 }
            );
        }
        return api500('Failed to upload resume', 'POST /api/upload/resume', error);
    }
}
