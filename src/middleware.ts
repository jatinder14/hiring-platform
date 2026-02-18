import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const role = token?.role as string | undefined;

        // 1. Protect Candidate Routes
        if (path.startsWith("/dashboard/jobs")) {
            if (role !== "candidate") {
                // If recruiter tries to access candidate route, redirect to their dashboard
                if (role === "recruiter") {
                    return NextResponse.redirect(new URL("/dashboard/company", req.url));
                }
                // Otherwise redirect to home
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // 2. Protect Employer/Recruiter Routes
        // Note: Assuming '/dashboard/company' or '/dashboard/talent' maps to recruiter dashboard.
        // Based on HeroNav, it seems to be '/dashboard/company'.
        if (path.startsWith("/dashboard/company") || path.startsWith("/dashboard/talent")) {
            if (role !== "recruiter") {
                // If candidate tries to access recruiter route, redirect to their dashboard
                if (role === "candidate") {
                    return NextResponse.redirect(new URL("/dashboard/jobs", req.url));
                }
                // Otherwise redirect to home
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
