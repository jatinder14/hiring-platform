
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export default async function CandidateApplicationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    // 1. Check Metadata
    let role = user.publicMetadata?.userRole as string | undefined;

    // 2. Fallback to unsafeMetadata
    if (!role) {
        role = user.unsafeMetadata?.userRole as string | undefined;
    }

    // 3. Fallback to Database
    if (!role) {
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: { userRole: true }
        });
        role = dbUser?.userRole || undefined;
    }

    // 🔒 SECURITY: Companies should NOT access candidate applications
    if (role === 'CLIENT') {
        console.log(`[Security] Company ${user.id} attempted to access candidate applications.`);
        redirect('/dashboard/company');
    }

    return <>{children}</>;
}
