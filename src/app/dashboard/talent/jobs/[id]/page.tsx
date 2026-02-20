'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import { toast } from 'sonner';
import { useRecruiterBasePath } from '@/components/RecruiterBasePathContext';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    MapPin,
    Briefcase,
    DollarSign,
    Calendar,
    CheckCircle2,
    Building2,
    Users,
    Loader2,
    AlertCircle,
    LayoutDashboard
} from 'lucide-react';

export default function ViewJobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: jobId } = use(params);
    const router = useRouter();
    const base = useRecruiterBasePath();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/company/jobs/${jobId}`);

                if (!res.ok) {
                    if (res.status === 404) notFound();
                    throw new Error('Failed to fetch job');
                }

                const data = await res.json();
                setJob(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    // Add Escape key listener for modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsDeleteModalOpen(false);
        };
        if (isDeleteModalOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isDeleteModalOpen]);

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/company/jobs/${job.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Job deleted successfully');
                router.push(`${base}/jobs`);
            } else {
                let errorMessage = 'Failed to delete job';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonErr) {
                    errorMessage = `${res.statusText || 'Server Error'} (${res.status})`;
                }
                toast.error(errorMessage);
            }
        } catch (err: unknown) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : 'Error deleting job');
        }
    };

    const getStatusStyle = (status: string) => {
        const s = status || 'DRAFT';
        const baseStyle = {
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'capitalize' as const,
            display: 'inline-block'
        };

        switch (s) {
            case 'ACTIVE':
                return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
            case 'DRAFT':
                return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
            case 'CLOSED':
            case 'ARCHIVED':
                return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
            default:
                return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!job) return <div style={{ padding: '32px', textAlign: 'center' }}>Job not found</div>;

    const statusStyle = getStatusStyle(job.status);
    const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            {/* Top Navigation */}
            <Link
                href={`${base}/jobs`}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    color: '#6b7280', textDecoration: 'none', marginBottom: '24px',
                    fontSize: '14px', fontWeight: '500'
                }}
            >
                <ArrowLeft size={18} /> Back to Jobs
            </Link>

            {/* Header Card */}
            <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Top Row: Status + Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={statusStyle}>{job.status?.toLowerCase() || 'draft'}</span>
                        <span style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} /> Posted on {postedDate}
                        </span>
                    </div>

                    {/* Title */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#111827', lineHeight: '1.2' }}>{job.title}</h1>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link
                                href={`${base}/jobs/${job.id}/edit`}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                    borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                                    backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db'
                                }}
                            >
                                <Pencil size={16} /> Edit Job
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                    borderRadius: '8px', border: '1px solid #fee2e2', fontSize: '14px', fontWeight: '500',
                                    backgroundColor: '#ffffff', color: '#dc2626', cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '15px' }}>
                            <Building2 size={18} style={{ color: '#9ca3af' }} />
                            <span style={{ fontWeight: '500' }}>{job.company || 'Your Company'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '15px' }}>
                            <MapPin size={18} style={{ color: '#9ca3af' }} />
                            <span>{job.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '15px' }}>
                            <Briefcase size={18} style={{ color: '#9ca3af' }} />
                            <span>{job.employmentType}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '15px' }}>
                            <DollarSign size={18} style={{ color: '#9ca3af' }} />
                            <span>{job.salary || 'Not specified'} {job.currency}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>

                {/* Left Column: Description & Skills */}
                <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Description */}
                    <div className="card" style={{ padding: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Job Description</h2>
                        <div style={{ color: '#4b5563', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '15px' }}>
                            {job.description}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="card" style={{ padding: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Skills & Requirements</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {job.skills && job.skills.length > 0 ? (
                                job.skills.map((skill: string, index: number) => (
                                    <span
                                        key={index}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 14px', borderRadius: '999px', fontSize: '14px', fontWeight: '500',
                                            backgroundColor: '#eff6ff', color: '#2563eb'
                                        }}
                                    >
                                        <CheckCircle2 size={14} style={{ opacity: 0.7 }} />
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No specific skills listed.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Key Details & Applicants */}
                <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Applicants Card */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} style={{ color: '#3b82f6' }} />
                            Applicants
                        </h3>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Applied</span>
                                <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{job._count?.applications || 0}</span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>Candidate pipeline size.</p>
                        </div>
                        <Link
                            href={`${base}/candidates?jobId=${job.id}`}
                            style={{
                                display: 'block', width: '100%', textAlign: 'center', padding: '12px',
                                backgroundColor: '#2563eb', color: 'white', borderRadius: '8px',
                                textDecoration: 'none', fontWeight: '600', fontSize: '14px'
                            }}
                        >
                            View Candidates
                        </Link>
                    </div>

                    {/* Job Details Sidebar */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Job Overview</h3>
                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '14px' }}>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280' }}>Category</span>
                                <span style={{ fontWeight: '500', color: '#111827' }}>{job.category || 'N/A'}</span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280' }}>Employment</span>
                                <span style={{ fontWeight: '500', color: '#111827' }}>{job.employmentType}</span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280' }}>Posted Date</span>
                                <span style={{ fontWeight: '500', color: '#111827' }}>{postedDate}</span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', paddingTop: '16px' }}>
                                <span style={{ color: '#6b7280' }}>Status</span>
                                <span style={{ fontWeight: '600', textTransform: 'capitalize', color: statusStyle.color }}>{job.status?.toLowerCase()}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsDeleteModalOpen(false);
                    }}
                    style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', cursor: 'pointer' }}
                >
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px', animation: 'fadeIn 0.2s ease-out', cursor: 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>Delete Job Post?</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>This action cannot be undone.</p>
                            </div>
                        </div>

                        <p style={{ margin: '0 0 24px', color: '#4b5563', lineHeight: '1.5', fontSize: '15px' }}>
                            Are you sure you want to delete this job? All associated applications will also be permanently removed.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db',
                                    backgroundColor: '#ffffff', color: '#374151', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    backgroundColor: '#dc2626', color: '#ffffff', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                                }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
