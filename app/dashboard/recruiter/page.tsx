import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RecruiterDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "recruiter") {
        redirect("/");
    }

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-4">Recruiter Dashboard</h1>
            <p>Welcome, {session.user.name}!</p>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h2 className="text-xl font-semibold">Your Job Postings</h2>
                <p className="text-gray-600">You haven't posted any jobs yet.</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Post a Job
                </button>
            </div>
        </div>
    );
}
