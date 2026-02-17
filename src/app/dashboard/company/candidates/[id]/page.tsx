'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    DollarSign,
    Clock,
    Download,
    ExternalLink,
    Linkedin,
    Github,
    Twitter,
    Loader2,
    Building2,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function CandidateProfilePage({ params }: { params: { id: string } }) {
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const id = Array.isArray(params.id) ? params.id[0] : params.id;
                const res = await fetch(`/api/company/applications/${id}`);

                if (!res.ok) {
                    if (res.status === 404) notFound();
                    throw new Error('Failed to fetch candidate profile');
                }

                const data = await res.json();
                setApplication(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [params]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!application) return;
        setStatusUpdating(true);
        try {
            const res = await fetch(`/api/company/applications/${application.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setApplication({ ...application, status: newStatus });
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!application) return <div style={{ padding: '32px', textAlign: 'center' }}>Candidate not found</div>;

    const { candidate, job } = application;

    // Helper for Status Badge
    const getStatusStyle = (status: string) => {
        const baseStyle = {
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'capitalize' as const,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
        };
        switch (status) {
            case 'HIRED': return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
            case 'INTERVIEW': return { ...baseStyle, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' };
            case 'REJECTED': return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
            case 'WITHDRAWN': return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' };
            default: return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
        }
    };

    const statusStyle = getStatusStyle(application.status);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Link href="/dashboard/company/candidates" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
                <ArrowLeft size={18} /> Back to Candidates
            </Link>

            {/* Header Profile Card */}
            <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>

                    {/* Key Info */}
                    <div style={{ display: 'flex', gap: '24px', flex: 1, flexWrap: 'wrap' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
                            backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '28px', fontWeight: 'bold', color: '#2563eb', flexShrink: 0
                        }}>
                            {candidate?.profileImageUrl ? (
                                <img src={candidate.profileImageUrl} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (candidate?.name || 'U').charAt(0).toUpperCase()
                            )}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                                        {candidate?.name || 'Unknown Candidate'}
                                    </h1>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        Applied for <span style={{ fontWeight: '600', color: '#374151' }}>{job?.title}</span>
                                        <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                                            {job?.employmentType}
                                        </span>
                                        {(job?.experienceMin !== undefined || job?.experienceMax !== undefined) && (
                                            <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '4px', fontWeight: '600' }}>
                                                {job.experienceMin}-{job.experienceMax} Yrs Exp Required
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <span style={statusStyle}>
                                    {application.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px' }}>
                                    <Mail size={16} style={{ color: '#9ca3af' }} />
                                    <span>{candidate?.email || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px' }}>
                                    <MapPin size={16} style={{ color: '#9ca3af' }} />
                                    <span>{application.city || 'Location not specified'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px' }}>
                                    <Calendar size={16} style={{ color: '#9ca3af' }} />
                                    <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>

                {/* Left Column: Details */}
                <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Professional Details */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Briefcase size={20} style={{ color: '#3b82f6' }} /> Professional Details
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Current CTC</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#111827' }}>
                                    <span style={{ color: '#9ca3af', fontWeight: '400', fontSize: '13px' }}>{application.currentCurrency || 'USD'}</span>
                                    {application.currentCTC && application.currentCTC !== '0' ? application.currentCTC : 'Not Provided'}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Expected CTC</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#111827' }}>
                                    <span style={{ color: '#9ca3af', fontWeight: '400', fontSize: '13px' }}>{application.expectedCurrency || 'USD'}</span>
                                    {application.expectedCTC && application.expectedCTC !== '0' ? application.expectedCTC : 'Not Provided'}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Notice Period</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#111827' }}>
                                    <Clock size={16} style={{ color: '#9ca3af' }} />
                                    {application.noticePeriod || 'Immediate'}
                                </div>
                            </div>
                        </div>

                        {application.motivation && (
                            <div style={{ marginTop: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Motivation / Cover Letter</label>
                                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                                    {application.motivation}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Resume Section */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={20} style={{ color: '#3b82f6' }} /> Resume / CV
                        </h2>

                        {application.resumeUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                                    <Briefcase size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#111827' }}>{candidate?.name || 'Candidate'}_Resume.pdf</h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Provided with application</p>
                                </div>
                                <a
                                    href={application.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                                >
                                    <ExternalLink size={16} /> View
                                </a>
                            </div>
                        ) : (
                            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No resume attached.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Status & Contact */}
                <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Status Management */}
                    <div className="card" style={{ padding: '24px', opacity: application.status === 'WITHDRAWN' ? 0.6 : 1 }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Update Status</h3>
                        {application.status === 'WITHDRAWN' ? (
                            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                                    Application Withdrawn by Candidate
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={() => handleStatusUpdate('INTERVIEW')}
                                    disabled={statusUpdating}
                                    style={{
                                        padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe',
                                        backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '600', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <Calendar size={18} /> Move to Interview
                                </button>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button
                                        onClick={() => handleStatusUpdate('HIRED')}
                                        disabled={statusUpdating}
                                        style={{
                                            padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0',
                                            backgroundColor: '#f0fdf4', color: '#166534', fontWeight: '600', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <CheckCircle2 size={18} /> Hire
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('REJECTED')}
                                        disabled={statusUpdating}
                                        style={{
                                            padding: '12px', borderRadius: '8px', border: '1px solid #fecaca',
                                            backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: '600', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Social Links (Placeholder as User schema lacks them, but UI requested it) */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Social Links</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-600" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                                <Linkedin size={20} color="#0077b5" />
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>LinkedIn Profile</span>
                            </a>
                            <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-600" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                                <Github size={20} color="#333" />
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>GitHub Profile</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
