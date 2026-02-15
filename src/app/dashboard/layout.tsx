import { currentUser } from '@clerk/nextjs/server';
import Sidebar from '@/components/dashboard/Sidebar';
import CompanySidebar from '@/components/dashboard/CompanySidebar';
import './dashboard.css';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();
    // Default to CANDIDATE sidebar if role is missing or not CLIENT
    const isCompany = user?.unsafeMetadata?.userRole === 'CLIENT';

    return (
        <div className="dashboard-container">
            {isCompany ? <CompanySidebar /> : <Sidebar />}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
