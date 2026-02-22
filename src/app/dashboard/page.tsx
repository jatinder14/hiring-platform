import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/api/auth/signin');
    }

    const isCompany = session.user?.role === 'recruiter';

    if (isCompany) {
        redirect('/dashboard/company');
    } else {
        redirect('/dashboard/jobs');
    }
}
