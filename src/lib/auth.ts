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
                const roleCookie = cookies().get("login_role")?.value;
                let initialRole: UserRole = UserRole.CANDIDATE;
                if (roleCookie === "recruiter") {
                    initialRole = UserRole.RECRUITER;
                }

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
