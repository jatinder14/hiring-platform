"use client";

import { useEffect } from "react";
import { SignIn, useAuth, useClerk } from "@clerk/nextjs";
import { AuthWrapper } from "@/components/AuthWrapper";

export default function SignInPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const { signOut } = useClerk();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            signOut();
        }
    }, [isLoaded, isSignedIn, signOut]);

    if (!isLoaded || isSignedIn) {
        return null;
    }

    return (
        <AuthWrapper>
            <SignIn
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                appearance={{
                    elements: {
                        rootBox: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        },
                        card: "auth-card mx-auto p-4 sm:p-10",
                        headerTitle: {
                            color: "#18181b",
                            fontSize: "1.875rem",
                            fontWeight: "900",
                            textAlign: "center",
                            marginBottom: "2rem",
                        },
                        headerSubtitle: "hidden",
                        formButtonPrimary: {
                            backgroundColor: "#7c3aed",
                            fontWeight: "bold",
                            padding: "1rem",
                            borderRadius: "0.75rem",
                            marginTop: "1rem",
                        },
                        formFieldLabel: {
                            color: "#71717a",
                            fontWeight: "bold",
                            marginBottom: "0.5rem",
                        },
                        formFieldInput: {
                            backgroundColor: "#fff",
                            borderColor: "#e4e4e7",
                            color: "#18181b",
                            borderRadius: "0.75rem",
                            padding: "1rem",
                        },
                        footerActionLink: {
                            color: "#7c3aed",
                            fontWeight: "bold",
                        },
                        socialButtonsBlockButton: "hidden",
                        dividerRow: "hidden",
                        identityPreviewText: { color: "#18181b" },
                        formFieldInputShowPasswordButton: { color: "#a1a1aa" },
                    }
                }}
            />
        </AuthWrapper>
    );
}
