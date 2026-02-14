import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Protect Candidate Routes
        if (path.startsWith("/dashboard/candidate") && token?.role !== "candidate") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Protect Recruiter Routes
        if (path.startsWith("/dashboard/recruiter") && token?.role !== "recruiter") {
            return NextResponse.redirect(new URL("/", req.url));
        }
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
