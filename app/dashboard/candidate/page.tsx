import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CandidateDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "candidate") {
        redirect("/"); // Or show an error
    }

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-4">Job Seeker Dashboard</h1>
            <p>Welcome, {session.user.name}!</p>
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                <h2 className="text-xl font-semibold">Your Applications</h2>
                <p className="text-gray-600">You haven't applied to any jobs yet.</p>
            </div>
        </div>
    );
}
