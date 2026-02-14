import { AuthWrapper } from "@/components/AuthWrapper";
import { SignInButtons } from "@/components/auth/SignInButtons";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
    return (
        <AuthWrapper>
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
                <div className="flex flex-col items-center gap-8 w-full max-w-[400px] p-8 glass-panel rounded-3xl relative z-20">

                    {/* Header Section with Logo */}
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00ffe6] to-[#007db3] shadow-[0_0_20px_rgba(0,255,230,0.3)] mb-2"></div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Welcome to HireU
                            </h1>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                                Sign in or create an account to find jobs or hire talent.
                            </p>
                        </div>
                    </div>

                    {/* Buttons Section */}
                    <div className="w-full">
                        <Suspense fallback={<div className="text-center text-slate-500 text-sm">Loading options...</div>}>
                            <SignInButtons />
                        </Suspense>
                    </div>

                    {/* Footer Terms */}
                    <p className="text-xs text-slate-500 text-center leading-relaxed px-4">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="text-slate-400 hover:text-[#00ffe6] transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-slate-400 hover:text-[#00ffe6] transition-colors">
                            Privacy Policy
                        </Link>.
                    </p>

                    {/* Back to Home */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-medium text-[#00ffe6] hover:text-[#00ffe6]/80 transition-colors mt-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                </div>
            </div>

            <style>{`
                .glass-panel {
                    background: rgba(10, 10, 15, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
                }
            `}</style>
        </AuthWrapper>
    );
}
