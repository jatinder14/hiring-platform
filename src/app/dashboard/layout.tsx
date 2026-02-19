import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from '@/components/dashboard/Sidebar';
import CompanySidebar from '@/components/dashboard/CompanySidebar';
import prisma from '@/lib/prisma';
import './dashboard.css';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/');
    }

    // Default to CANDIDATE sidebar if role is missing or not recruiter
    const isCompany = session?.user?.role === 'recruiter';

    return (
        <div className="dashboard-container">
            {isCompany ? <CompanySidebar /> : <Sidebar />}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
