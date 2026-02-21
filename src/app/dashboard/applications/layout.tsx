import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function CandidateApplicationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/');
    }

    const role = session?.user?.role as string | undefined;

    if (role === 'recruiter') {
        redirect('/dashboard/company');
    }

    return <>{children}</>;
}
