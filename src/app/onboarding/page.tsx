import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { updateUserRole } from "@/app/actions/user";

export default async function OnboardingPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    // If user already has a role, redirect to home
    if (user?.userRole) {
        redirect("/");
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Welcome to HireU
                    </h1>
                    <p className="mt-4 text-gray-400">
                        Please select your role to continue.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-8">
                    <form action={async () => {
                        "use server";
                        await updateUserRole("CLIENT");
                    }}>
                        <button
                            type="submit"
                            className="w-full flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors group"
                        >
                            <span className="text-2xl mb-2">🏢</span>
                            <span className="font-semibold text-lg">Hire a Talent</span>
                            <span className="text-sm text-gray-500 mt-1">I am a client</span>
                        </button>
                    </form>

                    <form action={async () => {
                        "use server";
                        await updateUserRole("CANDIDATE");
                    }}>
                        <button
                            type="submit"
                            className="w-full flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors group"
                        >
                            <span className="text-2xl mb-2">👨‍💻</span>
                            <span className="font-semibold text-lg">Find a Job</span>
                            <span className="text-sm text-gray-500 mt-1">I am a candidate</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
