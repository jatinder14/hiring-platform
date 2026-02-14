"use client";

import { signIn, useSession } from "next-auth/react";
import Script from "next/script";
import { useEffect, useState } from "react";

export function GoogleOneTap() {
    const { status } = useSession();
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated" && !disabled) {
            // Small delay to ensure script is loaded and window.google is available
            const timer = setTimeout(() => {
                if (window.google) {
                    window.google.accounts.id.initialize({
                        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                        callback: async (response: any) => {
                            // Call the CredentialsProvider we set up
                            const res = await signIn("googleonetap", {
                                credential: response.credential,
                                redirect: true,
                                callbackUrl: "/dashboard/candidate", // Default redirect, middleware will handle role-based routing if needed
                            });

                            if (res?.error) {
                                console.error("One Tap Sign In Failed", res.error);
                            }
                        },
                        cancel_on_tap_outside: false,
                    });

                    // Display the prompt
                    window.google.accounts.id.prompt((notification: any) => {
                        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                            console.log("One Tap skipped or not displayed:", notification.getNotDisplayedReason());
                            // Optional: set cookie to suppress for some time if closed by user
                            if (notification.isSkippedMoment()) {
                                setDisabled(true);
                            }
                        }
                    });
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, disabled]);

    if (status !== "unauthenticated") return null;

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => {
                // Trigger generic render if needed, but useEffect handles the main logic
                console.log("Google One Tap script loaded");
            }}
        />
    );
}

// Add global type to avoid TS errors
declare global {
    interface Window {
        google: any;
    }
}
