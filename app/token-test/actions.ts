"use server";

import { decode } from "next-auth/jwt";

export async function decryptToken(token: string) {
    try {
        const decoded = await decode({
            token,
            secret: process.env.NEXTAUTH_SECRET!,
        });
        return JSON.stringify(decoded, null, 2);
    } catch (e) {
        console.error("Token decryption failed:", e);
        return "Error: Could not decrypt token. Make sure it is a valid NextAuth JWE and the NEXTAUTH_SECRET is correct.";
    }
}
