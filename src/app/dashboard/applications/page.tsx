'use client';

import { useState, useEffect } from 'react';
import {
    Briefcase, Calendar, Filter, MoreVertical,
    CheckCircle, Clock, XCircle, UserCheck,
    AlertCircle, RefreshCw, Layers, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// --- Type Definitions ---
type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'HIRED' | 'WITHDRAWN';

type Application = {
    id: string;
    jobTitle: string;
    company: string;
    appliedDate: string;
    status: ApplicationStatus;
    experienceMin?: number | null;
    experienceMax?: number | null;
    location?: string;
    salary?: string;
    currency?: string;
    logo?: string;
};

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
    const s = status?.toUpperCase();

    // Define styles map for safety against missing Tailwind
    const variants: Record<string, { bg: string, color: string, icon: any, label: string }> = {
        'APPLIED': { bg: '#eff6ff', color: '#3b82f6', icon: Clock, label: 'Applied' },
        'SHORTLISTED': { bg: '#ecfdf5', color: '#059669', icon: UserCheck, label: 'Shortlisted' },
        'INTERVIEW': { bg: '#fff7ed', color: '#ea580c', icon: Calendar, label: 'Interview' },
        'REJECTED': { bg: '#fef2f2', color: '#dc2626', icon: XCircle, label: 'Rejected' },
        'HIRED': { bg: '#ecfdf5', color: '#16a34a', icon: CheckCircle, label: 'Hired' },
        'WITHDRAWN': { bg: '#f3f4f6', color: '#6b7280', icon: XCircle, label: 'Withdrawn' },
    };

    const variant = variants[s] || { bg: '#f3f4f6', color: '#374151', icon: Briefcase, label: status };
    const Icon = variant.icon;

    return (
        <span
            className="tag"
            style={{
                backgroundColor: variant.bg,
                color: variant.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: 600
            }}
        >
            <Icon size={14} style={{ flexShrink: 0 }} />
            {variant.label}
        </span>
    );
};

const LoadingSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map((i) => (
            <div key={i} className="job-card" style={{ opacity: 0.6 }}>
                <div style={{ width: '48px', height: '48px', background: '#e5e7eb', borderRadius: '12px' }}></div>
                <div style={{ flex: 1 }}>
                    <div style={{ height: '20px', width: '30%', background: '#e5e7eb', marginBottom: '8px', borderRadius: '4px' }}></div>
                    <div style={{ height: '16px', width: '20%', background: '#e5e7eb', borderRadius: '4px' }}></div>
                </div>
            </div>
        ))}
    </div>
);

const EmptyState = () => (
    <div className="card" style={{ textAlign: 'center', padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
            width: '64px', height: '64px', backgroundColor: '#eff6ff', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
        }}>
            <Layers className="text-primary" size={32} style={{ color: '#3b82f6' }} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Apply to View Applications</h3>
        <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.5' }}>
            You haven't applied to any jobs yet. Browse available jobs and start applying to track your progress here.
        </p>
        <Link href="/dashboard/jobs" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} />
            Browse Jobs
        </Link>
    </div>
);

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchApplications = async () => {
        // Optimistic cache load
        let hasCache = false;
        try {
            const cachedApps = sessionStorage.getItem('cached_user_applications');
            if (cachedApps) {
                setApplications(JSON.parse(cachedApps));
                hasCache = true;
                setLoading(false);
            }
        } catch (e) { console.error(e); }

        if (!hasCache) setLoading(true);

        // Don't clear error if we have cache, to avoid flashing error state if background fetch fails
        if (!hasCache) setError('');

        try {
            const res = await fetch('/api/applications', { cache: 'no-store' });

            if (!res.ok) {
                if (res.status === 401 || res.status === 404) {
                    setApplications([]);
                    sessionStorage.setItem('cached_user_applications', JSON.stringify([]));
                    return;
                }
                throw new Error('Failed to load applications');
            }

            const data = await res.json();

            // Transform data to match UI needs
            const mappedApps: Application[] = data.map((app: any) => ({
                id: app.id,
                jobTitle: app.job?.title || 'Unknown Role',
                company: app.job?.company || 'Unknown Company',
                appliedDate: app.appliedAt || app.appliedDate,
                status: app.status,
                experienceMin: app.job?.experienceMin,
                experienceMax: app.job?.experienceMax,
                location: app.job?.location,
                salary: app.job?.salary,
                currency: app.job?.currency,
                logo: (app.job?.company || 'C').substring(0, 2).toUpperCase()
            }));

            setApplications(mappedApps);
            sessionStorage.setItem('cached_user_applications', JSON.stringify(mappedApps));

        } catch (err: any) {
            console.error(err);
            if (!hasCache) {
                setError(err.message || 'Failed to load applications');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [refreshTrigger]);

    const handleWithdraw = async () => {
        if (!selectedAppId) return;
        setIsWithdrawing(true);
        try {
            const res = await fetch(`/api/applications/${selectedAppId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'WITHDRAWN' })
            });

            if (res.ok) {
                const updatedApps = applications.map(app =>
                    app.id === selectedAppId ? { ...app, status: 'WITHDRAWN' as ApplicationStatus } : app
                );
                setApplications(updatedApps);
                sessionStorage.setItem('cached_user_applications', JSON.stringify(updatedApps)); // Update cache

                setIsWithdrawModalOpen(false);
                toast.success('Application withdrawn successfully');
            } else {
                toast.error('Failed to withdraw application');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error withdrawing application');
        } finally {
            setIsWithdrawModalOpen(false); // Close modal first
            setIsWithdrawing(false);
            setSelectedAppId(null);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>

            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">My Applications</h1>
                    <p className="page-subtitle">Track and manage your job applications.</p>
                </div>
                <button
                    onClick={() => setRefreshTrigger(p => p + 1)}
                    className="btn-secondary"
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Refresh List"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <div className="card" style={{
                    padding: '32px', textAlign: 'center', border: '1px solid #fee2e2', backgroundColor: '#fef2f2'
                }}>
                    <div style={{
                        width: '48px', height: '48px', backgroundColor: '#fee2e2', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <AlertCircle className="text-danger" size={24} style={{ color: '#dc2626' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px' }}>Unable to Load Applications</h3>
                    <p style={{ color: '#b91c1c', marginBottom: '24px' }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                        style={{ backgroundColor: '#dc2626', border: 'none' }}
                    >
                        <RefreshCw size={18} style={{ marginRight: '8px' }} />
                        Reload Page
                    </button>
                </div>
            ) : applications.length > 0 ? (
                <div className="applications-list">
                    {applications.map((app) => (
                        <div key={app.id} className="job-card" style={{ gap: '20px', alignItems: 'flex-start' }}>
                            {/* Company Logo Placeholder */}
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                                color: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: '700',
                                border: '1px solid #dbeafe',
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                {app.logo}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, cursor: 'pointer' }}>
                                        {app.jobTitle}
                                    </h3>
                                    <StatusBadge status={app.status} />
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', color: '#374151' }}>
                                        <Briefcase size={15} style={{ color: '#9ca3af' }} />
                                        {app.company}
                                    </span>
                                    {app.location && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={15} style={{ color: '#9ca3af' }} />
                                            {app.location}
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={15} style={{ color: '#9ca3af' }} />
                                        Applied {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                {/* Footer Info */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                                    <div>
                                        {(app.experienceMin != null || app.experienceMax != null) && (
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
                                                borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                                                backgroundColor: '#f3f4f6', color: '#374151'
                                            }}>
                                                Exp: {app.experienceMin ?? 0}-{app.experienceMax ?? '?'} Yrs
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <button
                                            className="btn-secondary"
                                            style={{ border: 'none', background: 'transparent', padding: 0, color: '#4b5563', fontSize: '14px' }}
                                        >
                                            View Details
                                        </button>
                                        {['APPLIED', 'SHORTLISTED', 'INTERVIEW'].includes(app.status) && (
                                            <button
                                                onClick={() => {
                                                    setSelectedAppId(app.id);
                                                    setIsWithdrawModalOpen(true);
                                                }}
                                                style={{
                                                    border: 'none', background: 'transparent', padding: '0 0 0 16px',
                                                    color: '#ef4444', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                                    borderLeft: '1px solid #e5e7eb'
                                                }}
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState />
            )}

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center', margin: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', backgroundColor: '#fee2e2', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                        }}>
                            <AlertCircle size={24} style={{ color: '#dc2626' }} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>Withdraw Application?</h2>
                        <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
                            Are you sure you want to withdraw? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setIsWithdrawModalOpen(false);
                                    setSelectedAppId(null);
                                }}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                                disabled={isWithdrawing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                className="btn-primary"
                                style={{ flex: 1, backgroundColor: '#dc2626', border: 'none' }}
                                disabled={isWithdrawing}
                            >
                                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
