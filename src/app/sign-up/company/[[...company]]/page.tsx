import { SignUp } from "@clerk/nextjs";
import { AuthWrapper } from "@/components/AuthWrapper";

export default function CompanySignUpPage() {
    return (
        <AuthWrapper>
            <div style={{ width: '100%', maxWidth: '32rem' }} className="company-signup-wrapper">
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '900', color: '#fff' }}>Hire Talent</h2>
                    <p style={{ color: '#a1a1aa', marginTop: '0.5rem', fontWeight: '500', fontSize: '1.125rem' }}>Build Your Dream Team</p>
                </div>

                <SignUp
                    path="/sign-up/company"
                    routing="path"
                    signInUrl="/sign-in"
                    unsafeMetadata={{ userRole: "CLIENT" }}
                    appearance={{
                        elements: {
                            rootBox: {
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                            },
                            card: "auth-card mx-auto p-4 sm:p-10",
                            headerTitle: "hidden",
                            headerSubtitle: "hidden",
                            formButtonPrimary: {
                                backgroundColor: "#7c3aed",
                                fontWeight: "bold",
                                padding: "1rem",
                                borderRadius: "0.75rem",
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
                        }
                    }}
                />
            </div>
        </AuthWrapper>
    );
}
