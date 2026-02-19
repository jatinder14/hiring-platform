"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Update user role in Clerk metadata
 * Called from onboarding page when user selects their role
 */
export async function updateUserRole(role: "CLIENT" | "CANDIDATE") {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized - No user session found");
    }

    try {
        // Update Clerk user metadata - Use publicMetadata which is server-writable only
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: { userRole: role },
        });

        // Webhook will automatically sync this to MongoDB
        console.log(`Updated userRole to ${role} for user ${userId}`);
    } catch (error) {
        console.error("Failed to update user role:", error);
        throw new Error("Failed to update role. Please try again.");
    }

    // Redirect to dashboard (outside try-catch so Next.js can handle the redirect error)
    redirect("/dashboard");
}
