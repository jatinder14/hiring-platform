
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export default async function CompanyDashboardLayout({
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

    // 🔒 SECURITY: Protect Company Routes
    if (role !== 'CLIENT') {
        console.log(`[Security] User ${user.id} attempted to access company dashboard without CLIENT role.`);
        redirect('/dashboard');
    }

    return <>{children}</>;
}
