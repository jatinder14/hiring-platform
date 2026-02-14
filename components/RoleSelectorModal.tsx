"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RoleSelectorModal() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Open modal if authenticated but NO role
        if (status === "authenticated" && session?.user && !session.user.role) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [status, session]);

    const handleSelectRole = async (role: "candidate" | "recruiter") => {
        setLoading(true);
        try {
            // 1. Call API to update role in DB
            const res = await fetch("/api/user/role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });

            if (!res.ok) throw new Error("Failed to update role");

            // 2. Refresh session to get the new role
            await update({ role });

            // 3. Close modal and redirect
            setIsOpen(false);
            router.push(`/dashboard/${role}`);
            router.refresh();
        } catch (error) {
            console.error("Role selection failed", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                        👋
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to HireU!</h2>
                    <p className="text-gray-600 mb-8">
                        To get started, please tell us how you want to use the platform.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => handleSelectRole("candidate")}
                            disabled={loading}
                            className="group relative p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex items-center gap-4"
                        >
                            <span className="text-3xl">👷</span>
                            <div>
                                <div className="font-semibold text-gray-900">I'm a Candidate</div>
                                <div className="text-sm text-gray-500">I'm looking for a job</div>
                            </div>
                            <div className="absolute right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                            </div>
                        </button>

                        <button
                            onClick={() => handleSelectRole("recruiter")}
                            disabled={loading}
                            className="group relative p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left flex items-center gap-4"
                        >
                            <span className="text-3xl">👔</span>
                            <div>
                                <div className="font-semibold text-gray-900">I'm a Recruiter</div>
                                <div className="text-sm text-gray-500">I'm hiring talent</div>
                            </div>
                            <div className="absolute right-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                            </div>
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
