import Link from "next/link";
import { AuthWrapper } from "@/components/AuthWrapper";

export default function SignUpPage() {
    return (
        <AuthWrapper>
            <div style={{ width: '100%', maxWidth: '32rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#fff' }}>Join HireU</h2>
                    <p style={{ color: '#a1a1aa', marginTop: '0.75rem', fontWeight: '500', fontSize: '1.125rem' }}>Choose Your Path</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Link
                        href="/sign-up/talent"
                        className="auth-card"
                        style={{
                            position: 'relative',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '1rem',
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1.5rem'
                        }}>
                            <span style={{ fontSize: '1.875rem' }}>👨‍💻</span>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#18181b' }}>Sign up as Talent</h3>
                            <p style={{ color: '#71717a', fontSize: '0.875rem' }}>Find elite tech opportunities</p>
                        </div>
                        <span style={{ marginLeft: 'auto', color: '#e4e4e7', fontSize: '1.5rem', fontWeight: '900' }}>→</span>
                    </Link>

                    <Link
                        href="/sign-up/company"
                        className="auth-card"
                        style={{
                            position: 'relative',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '1rem',
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1.5rem'
                        }}>
                            <span style={{ fontSize: '1.875rem' }}>🏢</span>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#18181b' }}>Sign up as Company</h3>
                            <p style={{ color: '#71717a', fontSize: '0.875rem' }}>Hire vetted world-class engineers</p>
                        </div>
                        <span style={{ marginLeft: 'auto', color: '#e4e4e7', fontSize: '1.5rem', fontWeight: '900' }}>→</span>
                    </Link>
                </div>

                <p style={{ marginTop: '3rem', textAlign: 'center', color: '#71717a', fontWeight: 'bold' }}>
                    Already have an account?{" "}
                    <Link href="/sign-in" style={{ color: '#fff', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)' }}>
                        Login here
                    </Link>
                </p>
            </div>
        </AuthWrapper>
    );
}
