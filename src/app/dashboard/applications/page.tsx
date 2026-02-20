'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Briefcase, Calendar, MapPin, DollarSign, Clock,
    CheckCircle, XCircle, UserCheck, AlertCircle,
    RefreshCw, Layers, X, Building2, Tag,
    ChevronRight, ExternalLink, Loader2, FileText,
    BadgeCheck, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatSalary } from '@/components/ui/SalaryInput';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'HIRED' | 'WITHDRAWN';

type Application = {
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    appliedDate: string;
    status: ApplicationStatus;
    experienceMin?: number | null;
    experienceMax?: number | null;
    location?: string;
    salary?: string;
    currency?: string;
    employmentType?: string;
    category?: string;
    skills?: string[];
    description?: string;
    jobStatus?: string;
    createdAt?: string;
    logo: string;
};

type JobDetail = {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    employmentType: string;
    category: string;
    skills: string[];
    salary?: string;
    currency?: string;
    experienceMin?: number | null;
    experienceMax?: number | null;
    status: string;
    createdAt: string;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: any; label: string; border: string }> = {
    APPLIED: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe', icon: Clock, label: 'Applied' },
    SHORTLISTED: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: UserCheck, label: 'Shortlisted' },
    INTERVIEW: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', icon: Calendar, label: 'Interview' },
    REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: XCircle, label: 'Rejected' },
    HIRED: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: CheckCircle, label: 'Hired 🎉' },
    WITHDRAWN: { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb', icon: XCircle, label: 'Withdrawn' },
};

const StatusBadge = ({ status, large = false }: { status: string; large?: boolean }) => {
    const cfg = STATUS_CONFIG[status?.toUpperCase()] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', icon: Briefcase, label: status };
    const Icon = cfg.icon;
    return (
        <span style={{
            backgroundColor: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: large ? '8px 16px' : '5px 12px',
            borderRadius: '99px',
            fontSize: large ? '14px' : '12px',
            fontWeight: 600,
        }}>
            <Icon size={large ? 16 : 13} style={{ flexShrink: 0 }} />
            {cfg.label}
        </span>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const LoadingSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map(i => (
            <div key={i} className="job-card animate-pulse" style={{ opacity: 0.55 }}>
                <div style={{ width: '56px', height: '56px', background: '#e5e7eb', borderRadius: '14px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ height: '20px', width: '45%', background: '#e5e7eb', borderRadius: '4px' }} />
                    <div style={{ height: '15px', width: '30%', background: '#e5e7eb', borderRadius: '4px' }} />
                    <div style={{ height: '14px', width: '60%', background: '#e5e7eb', borderRadius: '4px' }} />
                </div>
            </div>
        ))}
    </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
    <div className="card" style={{ textAlign: 'center', padding: '72px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
            width: '80px', height: '80px', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px', boxShadow: '0 4px 12px rgba(59,130,246,0.15)'
        }}>
            <Layers size={36} style={{ color: '#3b82f6' }} />
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>No Applications Yet</h3>
        <p style={{ color: '#6b7280', maxWidth: '380px', lineHeight: '1.6', marginBottom: '28px', fontSize: '15px' }}>
            You haven't applied to any jobs yet. Explore opportunities and start your journey!
        </p>
        <Link href="/dashboard/jobs" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px' }}>
            <Briefcase size={18} /> Browse Jobs
        </Link>
    </div>
);

// ─── Job Detail Drawer / Modal ────────────────────────────────────────────────

function JobDetailModal({
    app,
    onClose,
}: {
    app: Application;
    onClose: () => void;
}) {
    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Populate instantly from cached app data, then enrich via API
    useEffect(() => {
        // Pre-fill from cached list data
        setJob({
            id: app.jobId,
            title: app.jobTitle,
            company: app.company,
            location: app.location || '',
            description: app.description || '',
            employmentType: app.employmentType || '',
            category: app.category || '',
            skills: app.skills || [],
            salary: app.salary,
            currency: app.currency,
            experienceMin: app.experienceMin,
            experienceMax: app.experienceMax,
            status: app.jobStatus || 'ACTIVE',
            createdAt: app.createdAt || '',
        });
        setLoading(false);

        // Fetch fresh data in background
        fetch(`/api/jobs/${app.jobId}`)
            .then(r => {
                if (r.status === 404) { setNotFound(true); return null; }
                return r.json();
            })
            .then(data => {
                if (data) setJob(data);
            })
            .catch(() => { /* keep cached data */ });
    }, [app]);

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const currencySymbol = job?.currency === 'INR' ? '₹' : job?.currency === 'EUR' ? '€' : job?.currency === 'GBP' ? '£' : '$';
    const logoText = (job?.company || 'J').substring(0, 2).toUpperCase();
    const expText = job?.experienceMin != null
        ? `${job.experienceMin}${job.experienceMax != null ? `–${job.experienceMax}` : '+'} yrs`
        : null;
    const salaryText = job?.salary
        ? job.salary.includes(' - ')
            ? job.salary.split(' - ').map(s => `${currencySymbol}${formatSalary(s.replace(/\D/g, ''), job.currency || 'USD')}`).join(' – ')
            : `${currencySymbol}${formatSalary(job.salary.replace(/\D/g, ''), job.currency || 'USD')}`
        : null;
    const postedDate = job?.createdAt
        ? new Date(job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* Drawer Panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
                width: '100%', maxWidth: '680px',
                background: '#fff',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column',
                animation: 'slideInRight 0.28s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
            }}>
                {/* ── Header ── */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex', alignItems: 'flex-start', gap: '16px',
                    background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
                    flexShrink: 0,
                }}>
                    {/* Logo */}
                    <div style={{
                        width: '60px', height: '60px', flexShrink: 0,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
                    }}>
                        {logoText}
                    </div>

                    {/* Title block */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#111827', lineHeight: 1.2 }}>
                            {loading && !job ? 'Loading...' : job?.title}
                        </h2>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#4b5563' }}>
                            {job?.company}
                        </p>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <StatusBadge status={app.status} large />
                            {job?.status && job.status !== 'ACTIVE' && (
                                <span style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '99px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: 600 }}>
                                    {job.status === 'CLOSED' ? 'Position Closed' : job.status === 'ARCHIVED' ? 'Position Archived' : job.status}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none', background: 'white', cursor: 'pointer',
                            borderRadius: '10px', padding: '8px',
                            color: '#6b7280', display: 'flex',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            flexShrink: 0,
                        }}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>

                    {notFound ? (
                        /* Job deleted fallback */
                        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                            <div style={{
                                width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <AlertCircle size={30} style={{ color: '#dc2626' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                                Job No Longer Available
                            </h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.6', maxWidth: '320px', margin: '0 auto' }}>
                                This job posting has been removed or is no longer active. Your application record is still preserved.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ── Quick Info Chips ── */}
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid #f3f4f6',
                                display: 'flex', flexWrap: 'wrap', gap: '10px'
                            }}>
                                {job?.location && (
                                    <InfoChip icon={<MapPin size={14} />} label={job.location} />
                                )}
                                {job?.employmentType && (
                                    <InfoChip icon={<Clock size={14} />} label={job.employmentType} />
                                )}
                                {job?.category && (
                                    <InfoChip icon={<Tag size={14} />} label={job.category} />
                                )}
                                {expText && (
                                    <InfoChip icon={<TrendingUp size={14} />} label={`${expText} experience`} />
                                )}
                                {salaryText && (
                                    <InfoChip icon={<DollarSign size={14} />} label={salaryText} highlight />
                                )}
                                {postedDate && (
                                    <InfoChip icon={<Calendar size={14} />} label={`Posted ${postedDate}`} />
                                )}
                            </div>

                            {/* ── Application Timeline ── */}
                            <Section title="Your Application" icon={<FileText size={16} />}>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                }}>
                                    <DetailCard
                                        label="Applied On"
                                        value={new Date(app.appliedDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                    />
                                    <DetailCard
                                        label="Current Status"
                                        value={<StatusBadge status={app.status} />}
                                    />
                                </div>
                                <StatusTimeline status={app.status} />
                            </Section>

                            {/* ── Skills ── */}
                            {job?.skills && job.skills.length > 0 && (
                                <Section title="Required Skills" icon={<BadgeCheck size={16} />}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {job.skills.map(skill => (
                                            <span key={skill} style={{
                                                padding: '6px 14px', borderRadius: '8px',
                                                fontSize: '13px', fontWeight: '600',
                                                background: '#f0f9ff', color: '#0369a1',
                                                border: '1px solid #bae6fd',
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* ── Description ── */}
                            {job?.description && (
                                <Section title="Job Description" icon={<FileText size={16} />}>
                                    <div
                                        style={{
                                            fontSize: '14px', lineHeight: '1.8', color: '#374151',
                                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: (() => {
                                                try {
                                                    // If description is EditorJS JSON, try to parse it
                                                    const parsed = JSON.parse(job.description);
                                                    if (parsed?.blocks) {
                                                        return parsed.blocks.map((b: any) => {
                                                            if (b.type === 'header') return `<h${b.data.level} style="margin:0 0 8px;font-weight:700;color:#111827">${b.data.text}</h${b.data.level}>`;
                                                            if (b.type === 'paragraph') return `<p style="margin:0 0 12px">${b.data.text}</p>`;
                                                            if (b.type === 'list') return `<ul style="margin:0 0 12px;padding-left:20px">${b.data.items.map((i: string) => `<li style="margin-bottom:4px">${i}</li>`).join('')}</ul>`;
                                                            return `<p style="margin:0 0 8px">${b.data?.text || ''}</p>`;
                                                        }).join('');
                                                    }
                                                } catch { /* not JSON, render as plain text */ }
                                                return job.description.replace(/\n/g, '<br/>');
                                            })()
                                        }}
                                    />
                                </Section>
                            )}
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex', gap: '12px', justifyContent: 'flex-end',
                    background: '#fafafa', flexShrink: 0,
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb',
                            background: 'white', color: '#374151', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                        }}
                    >
                        Close
                    </button>
                    {app.jobId && !notFound && (
                        <Link
                            href={`/dashboard/jobs/${app.jobId}`}
                            style={{
                                padding: '10px 20px', borderRadius: '10px', background: '#3b82f6',
                                color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                            }}
                        >
                            <ExternalLink size={15} /> View Job Page
                        </Link>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
                @media (max-width: 680px) {
                    /* Full-screen on mobile */
                    [data-modal-drawer] { max-width: 100% !important; }
                }
            `}</style>
        </>
    );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

const InfoChip = ({ icon, label, highlight = false }: { icon: React.ReactNode; label: string; highlight?: boolean }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
        background: highlight ? '#eff6ff' : '#f9fafb',
        color: highlight ? '#1d4ed8' : '#374151',
        border: `1px solid ${highlight ? '#bfdbfe' : '#e5e7eb'}`,
    }}>
        <span style={{ color: highlight ? '#3b82f6' : '#9ca3af' }}>{icon}</span>
        {label}
    </span>
);

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f9fafb' }}>
        <h3 style={{
            margin: '0 0 16px', fontSize: '14px', fontWeight: '700',
            color: '#111827', display: 'flex', alignItems: 'center', gap: '8px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
            <span style={{ color: '#3b82f6' }}>{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);

const DetailCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div style={{
        padding: '12px 16px', background: '#f9fafb', borderRadius: '10px',
        border: '1px solid #f3f4f6',
    }}>
        <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
        </p>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{value}</div>
    </div>
);

const STATUS_STEPS = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW', label: 'Interview' },
    { key: 'HIRED', label: 'Hired' },
];

const StatusTimeline = ({ status }: { status: string }) => {
    const isRejected = status === 'REJECTED';
    const isWithdrawn = status === 'WITHDRAWN';
    const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);

    if (isRejected || isWithdrawn) {
        return (
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <XCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#991b1b', fontWeight: '500' }}>
                    {isRejected ? 'Your application was not selected this time.' : 'You withdrew this application.'}
                </p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '0' }}>
            {STATUS_STEPS.map((step, idx) => {
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: done ? (active ? '#3b82f6' : '#22c55e') : '#e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: active ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none',
                                transition: 'all 0.2s',
                            }}>
                                {done
                                    ? <CheckCircle size={14} color="#fff" />
                                    : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d1d5db' }} />
                                }
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: active ? '700' : '500', color: done ? '#111827' : '#9ca3af', whiteSpace: 'nowrap' }}>
                                {step.label}
                            </span>
                        </div>
                        {idx < STATUS_STEPS.length - 1 && (
                            <div style={{
                                flex: 1, height: '2px', margin: '0 4px', marginBottom: '16px',
                                background: idx < currentIdx ? '#22c55e' : '#e5e7eb',
                                transition: 'background 0.3s',
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Withdraw modal
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // View details drawer
    const [detailApp, setDetailApp] = useState<Application | null>(null);

    const fetchApplications = useCallback(async () => {
        let hasCache = false;
        try {
            const cached = sessionStorage.getItem('cached_user_applications_v2');
            if (cached) {
                setApplications(JSON.parse(cached));
                hasCache = true;
                setLoading(false);
            }
        } catch { /* ignore */ }

        if (!hasCache) { setLoading(true); setError(''); }

        try {
            const res = await fetch('/api/applications', { cache: 'no-store' });

            if (!res.ok) {
                if (res.status === 401 || res.status === 404) {
                    setApplications([]);
                    sessionStorage.setItem('cached_user_applications_v2', JSON.stringify([]));
                    return;
                }
                throw new Error('Failed to load applications');
            }

            const data = await res.json();

            const mapped: Application[] = data.map((app: any) => ({
                id: app.id,
                jobId: app.job?.id || '',
                jobTitle: app.job?.title || 'Unknown Role',
                company: app.job?.company || 'Unknown Company',
                appliedDate: app.appliedAt || app.appliedDate,
                status: app.status,
                experienceMin: app.job?.experienceMin,
                experienceMax: app.job?.experienceMax,
                location: app.job?.location,
                salary: app.job?.salary,
                currency: app.job?.currency,
                employmentType: app.job?.employmentType,
                category: app.job?.category,
                skills: app.job?.skills || [],
                description: app.job?.description,
                jobStatus: app.job?.status,
                createdAt: app.job?.createdAt,
                logo: (app.job?.company || 'C').substring(0, 2).toUpperCase(),
            }));

            setApplications(mapped);
            sessionStorage.setItem('cached_user_applications_v2', JSON.stringify(mapped));
        } catch (err: any) {
            if (!hasCache) setError(err.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchApplications(); }, [fetchApplications, refreshTrigger]);

    const handleWithdraw = async () => {
        if (!selectedAppId) return;
        setIsWithdrawing(true);
        try {
            const res = await fetch(`/api/applications/${selectedAppId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'WITHDRAWN' }),
            });
            if (res.ok) {
                const updated = applications.map(a =>
                    a.id === selectedAppId ? { ...a, status: 'WITHDRAWN' as ApplicationStatus } : a
                );
                setApplications(updated);
                sessionStorage.setItem('cached_user_applications_v2', JSON.stringify(updated));
                // Update drawer if open
                if (detailApp?.id === selectedAppId) setDetailApp(prev => prev ? { ...prev, status: 'WITHDRAWN' } : null);
                toast.success('Application withdrawn');
            } else {
                toast.error('Failed to withdraw');
            }
        } catch {
            toast.error('Error withdrawing application');
        } finally {
            setIsWithdrawModalOpen(false);
            setIsWithdrawing(false);
            setSelectedAppId(null);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>

            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">My Applications</h1>
                    <p className="page-subtitle">
                        {applications.length > 0 ? `${applications.length} application${applications.length > 1 ? 's' : ''} found` : 'Track and manage your job applications.'}
                    </p>
                </div>
                <button
                    onClick={() => setRefreshTrigger(p => p + 1)}
                    className="btn-secondary"
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Refresh"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <div className="card" style={{ padding: '32px', textAlign: 'center', border: '1px solid #fee2e2', background: '#fef2f2' }}>
                    <AlertCircle size={32} style={{ color: '#dc2626', marginBottom: '12px' }} />
                    <h3 style={{ color: '#991b1b', marginBottom: '8px' }}>Unable to Load Applications</h3>
                    <p style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary" style={{ background: '#dc2626', border: 'none' }}>
                        <RefreshCw size={16} style={{ marginRight: '8px' }} /> Reload
                    </button>
                </div>
            ) : applications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {applications.map(app => (
                        <div
                            key={app.id}
                            className="job-card"
                            style={{ gap: '20px', alignItems: 'flex-start', cursor: 'default' }}
                        >
                            {/* Logo */}
                            <div style={{
                                width: '56px', height: '56px', flexShrink: 0,
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px',
                                boxShadow: '0 2px 8px rgba(99,102,241,0.2)',
                            }}>
                                {app.logo}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Title + status row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                    <h3
                                        onClick={() => setDetailApp(app)}
                                        style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0, cursor: 'pointer' }}
                                        title="Click to view details"
                                    >
                                        {app.jobTitle}
                                    </h3>
                                    <StatusBadge status={app.status} />
                                </div>

                                {/* Meta */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', color: '#6b7280', fontSize: '14px', marginBottom: '14px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: '#374151' }}>
                                        <Building2 size={14} style={{ color: '#9ca3af' }} />
                                        {app.company}
                                    </span>
                                    {app.location && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <MapPin size={14} style={{ color: '#9ca3af' }} />
                                            {app.location}
                                        </span>
                                    )}
                                    {app.employmentType && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Clock size={14} style={{ color: '#9ca3af' }} />
                                            {app.employmentType}
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Calendar size={14} style={{ color: '#9ca3af' }} />
                                        Applied {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                {/* Footer */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {(app.experienceMin != null || app.experienceMax != null) && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#f3f4f6', color: '#374151' }}>
                                                <TrendingUp size={12} />
                                                {app.experienceMin ?? 0}–{app.experienceMax ?? '?'} yrs exp
                                            </span>
                                        )}
                                        {app.salary && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#f0fdf4', color: '#166534', border: '1px solid #dcfce7' }}>
                                                <DollarSign size={12} />
                                                {app.currency === 'INR' ? '₹' : '$'}{app.salary}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => setDetailApp(app)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                padding: '8px 16px', border: '1px solid #e5e7eb',
                                                borderRadius: '8px', background: 'white', color: '#374151',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLElement).style.color = '#3b82f6'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
                                        >
                                            View Details <ChevronRight size={14} />
                                        </button>

                                        {['APPLIED', 'SHORTLISTED', 'INTERVIEW'].includes(app.status) && (
                                            <button
                                                onClick={() => { setSelectedAppId(app.id); setIsWithdrawModalOpen(true); }}
                                                style={{
                                                    padding: '8px 14px', border: '1px solid #fee2e2',
                                                    borderRadius: '8px', background: 'white', color: '#ef4444',
                                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
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

            {/* ── View Details Drawer ── */}
            {detailApp && (
                <JobDetailModal
                    app={detailApp}
                    onClose={() => setDetailApp(null)}
                />
            )}

            {/* ── Withdraw Confirmation Modal ── */}
            {isWithdrawModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '36px', textAlign: 'center', margin: '20px' }}>
                        <div style={{
                            width: '52px', height: '52px', background: '#fee2e2', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                        }}>
                            <AlertCircle size={26} style={{ color: '#dc2626' }} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>Withdraw Application?</h2>
                        <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '14px', lineHeight: '1.6' }}>
                            Are you sure you want to withdraw this application? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setIsWithdrawModalOpen(false); setSelectedAppId(null); }}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                                disabled={isWithdrawing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                    background: '#dc2626', color: 'white', fontSize: '14px', fontWeight: '600',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                                disabled={isWithdrawing}
                            >
                                {isWithdrawing ? <><Loader2 size={16} className="animate-spin" /> Withdrawing...</> : 'Withdraw'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
