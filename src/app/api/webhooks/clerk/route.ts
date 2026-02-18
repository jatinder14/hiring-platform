import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * PRODUCTION-GRADE CLERK WEBHOOK HANDLER
 * Synchronizes Clerk user events with MongoDB via Prisma.
 */

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("CRITICAL: CLERK_WEBHOOK_SECRET is not defined in environment variables.");
        return new Response("Webhook configuration error", { status: 500 });
    }

    // Header Validation
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Unauthorized - missing svix headers", { status: 400 });
    }

    // Payload Parsing
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    // Verification
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Webhook verification failed:", err);
        return new Response("Invalid signature", { status: 400 });
    }

    const eventType = evt.type;
    console.log(`Processing Clerk Webhook: ${eventType} (ID: ${evt.data.id})`);

    try {
        // 1. Handle Create/Update
        if (eventType === "user.created" || eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata, public_metadata } = evt.data;
            const email = email_addresses?.[0]?.email_address;

            if (!email) {
                console.warn(`User ${id} has no primary email address. Skipping sync.`);
                return new Response("Skipped - No email", { status: 200 });
            }

            const name = `${first_name || ""} ${last_name || ""}`.trim() || null;
            // Prefer public_metadata for security, fallback to unsafe for compatibility
            const userRole = (public_metadata?.userRole || unsafe_metadata?.userRole || "CANDIDATE") as "CLIENT" | "CANDIDATE";

            await prisma.user.upsert({
                where: { clerkId: id },
                update: {
                    email,
                    name,
                    profileImageUrl: image_url,
                    userRole: userRole,
                },
                create: {
                    clerkId: id,
                    email,
                    name,
                    profileImageUrl: image_url,
                    userRole,
                },
            });

            console.log(`Successfully synced user ${id} (Role: ${userRole})`);
        }

        // 2. Handle Delete
        if (eventType === "user.deleted") {
            const { id } = evt.data;
            if (id) {
                await prisma.user.deleteMany({
                    where: { clerkId: id },
                });
                console.log(`Successfully deleted user ${id}`);
            }
        }
    } catch (dbError) {
        console.error("Database synchronization failed:", dbError);
        // Return 500 so Clerk retries the webhook
        return new Response("Database Error", { status: 500 });
    }

    return new Response("Webhook Processed", { status: 200 });
}
