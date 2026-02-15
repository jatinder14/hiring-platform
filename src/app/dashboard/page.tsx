import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
    const user = await currentUser();
    const isCompany = user?.unsafeMetadata?.userRole === 'CLIENT';

    if (isCompany) {
        redirect('/dashboard/company');
    } else {
        redirect('/dashboard/jobs');
    }
}
