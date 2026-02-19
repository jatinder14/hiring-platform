import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RecruiterBasePathProvider } from '@/components/RecruiterBasePathContext';

export default async function TalentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/');
    }

    const role = session?.user?.role as string | undefined;

    if (role !== 'recruiter') {
        redirect('/dashboard/jobs');
    }

    return (
        <RecruiterBasePathProvider value="/dashboard/talent">
            {children}
        </RecruiterBasePathProvider>
    );
}
