
import { currentUser } from '@clerk/nextjs/server';
import Sidebar from '@/components/dashboard/Sidebar';
import CompanySidebar from '@/components/dashboard/CompanySidebar';
import prisma from '@/lib/prisma';
import './dashboard.css';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    // 1. Check Metadata
    let role = user?.publicMetadata?.userRole as string | undefined;

    // 2. Fallback to unsafeMetadata
    if (user && !role) {
        role = user.unsafeMetadata?.userRole as string | undefined;
    }

    // 3. Fallback to Database
    if (user && !role) {
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: { userRole: true }
        });
        role = dbUser?.userRole || undefined;
    }

    const isCompany = role === 'CLIENT';

    return (
        <div className="dashboard-container">
            {isCompany ? <CompanySidebar /> : <Sidebar />}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
