import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file: any = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename to prevent path traversal
        const filename = file.name.replaceAll(" ", "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const finalFilename = uniqueSuffix + '-' + filename;

        // In production, this path will be ephemeral. Use cloud storage instead.
        const uploadDir = join(process.cwd(), 'public/uploads');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if directory exists
        }

        const filePath = join(uploadDir, finalFilename);
        await writeFile(filePath, buffer);

        // Construct public URL
        const fileUrl = `/uploads/${finalFilename}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
            message: "File uploaded successfully"
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
    }
}
