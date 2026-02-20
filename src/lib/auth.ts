import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import { cookies } from "next/headers";
import prisma from "./db";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
        }),
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        jwt: async ({ token, user, trigger }) => {
            if (user && user.email) {
                let initialRole: UserRole = UserRole.CANDIDATE;
                try {
                    const cookieStore = await cookies();
                    const roleCookie = cookieStore.get("login_role")?.value;
                    if (roleCookie === "recruiter") {
                        initialRole = UserRole.RECRUITER;
                    }
                } catch (error) {
                    console.error("Error reading cookies in auth:", error);
                    // Default to CANDIDATE if cookie fails
                }

                try {
                    const dbUser = await prisma.user.upsert({
                        where: { email: user.email },
                        update: {},
                        create: {
                            email: user.email,
                            name: user.name,
                            profileImageUrl: user.image,
                            userRole: initialRole,
                        },
                    });

                    // Always use the role from the database
                    token.role = dbUser.userRole === UserRole.RECRUITER ? "recruiter" : "candidate";
                    token.id = dbUser.id;
                } catch (dbError) {
                    console.error("Database error in auth upsert:", dbError);
                    // Fallback: use initialRole if DB fails (shouldn't happen but safe)
                    token.role = initialRole === UserRole.RECRUITER ? "recruiter" : "candidate";
                    // token.id might be missing, user creation failed?
                }
            } else if (!token.role && token.email) {
                // Return user session but role is missing (e.g. from old session), fetch it
                try {
                    const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
                    if (dbUser) {
                        token.role = dbUser.userRole === UserRole.RECRUITER ? "recruiter" : "candidate";
                        token.id = dbUser.id;
                    }
                } catch (fetchError) {
                    console.error("Error fetching user role:", fetchError);
                }
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;
            }
            return session;
        },
        redirect: async ({ url, baseUrl }) => {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
        signIn: '/sign-in',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
