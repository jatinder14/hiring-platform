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
                // Check if user exists in DB
                let dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                // If new user, create record with role from cookie (or default)
                if (!dbUser) {
                    try {
                        const roleCookie = cookies().get("login_role")?.value;
                        console.log(`[AUTH] Login Role Cookie Found: "${roleCookie}"`);

                        let initialRole: UserRole = UserRole.CANDIDATE;

                        if (roleCookie === "recruiter") {
                            initialRole = UserRole.RECRUITER;
                        }

                        console.log(`[AUTH] Creating new user: ${user.email} with role: ${initialRole}`);

                        dbUser = await prisma.user.create({
                            data: {
                                email: user.email,
                                name: user.name,
                                profileImageUrl: user.image,
                                userRole: initialRole,
                            }
                        });
                        console.log(`[AUTH] User created successfully: ${dbUser.id}`);
                    } catch (error) {
                        console.error("[AUTH] Failed to create user:", error);
                        throw error;
                    }
                }

                // LEGACY MIGRATION: If user has old 'CLIENT' role, update to 'RECRUITER'
                if (dbUser.userRole === UserRole.CLIENT) {
                    console.log(`[AUTH] Migrating legacy user ${dbUser.email} from CLIENT to RECRUITER`);
                    dbUser = await prisma.user.update({
                        where: { id: dbUser.id },
                        data: { userRole: UserRole.RECRUITER }
                    });
                }

                // Always use the role from the database
                token.role = dbUser.userRole === UserRole.RECRUITER ? "recruiter" : "candidate";
                token.id = dbUser.id;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.id as string;
                // @ts-ignore
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
