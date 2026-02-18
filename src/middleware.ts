import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const role = token?.role as string | undefined;

        // 1. Protect Candidate Routes
        if (
            path.startsWith("/dashboard/jobs") ||
            path.startsWith("/dashboard/applications")
        ) {
            if (role !== "candidate") {
                if (role === "recruiter") {
                    return NextResponse.redirect(new URL("/dashboard/talent", req.url));
                }
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // 2. Protect Employer/Recruiter Routes
        if (
            path.startsWith("/dashboard/talent") ||
            path.startsWith("/dashboard/company") ||
            path.startsWith("/dashboard/candidates")
        ) {
            if (role !== "recruiter") {
                if (role === "candidate") {
                    return NextResponse.redirect(new URL("/dashboard/jobs", req.url));
                }
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};
