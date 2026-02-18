import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
    "/",  // Home page is public
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)", // Webhooks MUST be public for Clerk to call them
    "/api/jobs(.*)",     // Public job listing (though GET handles visibility)
]);

const isDashboardRoute = createRouteMatcher([
    "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();
    // const { pathname } = request.nextUrl; // Unused but kept for structure

    // Protect dashboard routes - redirect to sign-in if not authenticated
    if (isDashboardRoute(request) && !userId) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('redirect_url', request.url);
        return NextResponse.redirect(signInUrl);
    }

    // General protection for non-public routes
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
