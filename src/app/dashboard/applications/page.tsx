'use client';

import { useState, useEffect } from 'react';
import {
    Briefcase, Calendar, ChevronRight, Filter,
    MoreVertical, CheckCircle, Clock, XCircle, UserCheck
} from 'lucide-react';
import Link from 'next/link';

const getStatusBadge = (status: string) => {
    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap' as const
    };

    // Normalize for consistent checking if needed, or just handle cases.
    switch (status?.toUpperCase()) {
        case 'APPLIED':
            return <span className="tag" style={{ ...badgeStyle, backgroundColor: '#eff6ff', color: '#3b82f6' }}><Clock size={14} style={{ flexShrink: 0 }} /> <span>Applied</span></span>;
        case 'SHORTLISTED':
            return <span className="tag" style={{ ...badgeStyle, backgroundColor: '#ecfdf5', color: '#10b981' }}><UserCheck size={14} style={{ flexShrink: 0 }} /> <span>Shortlisted</span></span>;
        case 'INTERVIEW':
            return <span className="tag" style={{ ...badgeStyle, backgroundColor: '#fff7ed', color: '#f97316' }}><Clock size={14} style={{ flexShrink: 0 }} /> <span>Interview</span></span>;
        case 'REJECTED':
            return <span className="tag" style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: '#ef4444' }}><XCircle size={14} style={{ flexShrink: 0 }} /> <span>Rejected</span></span>;
        case 'HIRED':
            return <span className="tag" style={{ ...badgeStyle, backgroundColor: '#ecfdf5', color: '#10b981' }}><CheckCircle size={14} style={{ flexShrink: 0 }} /> <span>Hired</span></span>;
        default:
            return <span className="tag" style={badgeStyle}>{status}</span>;
    }
};

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await fetch('/api/applications', { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch applications');

                const data = await res.json();

                const mappedApps = data.map((app: any) => ({
                    id: app.id,
                    jobTitle: app.job.title,
                    company: app.job.company,
                    appliedDate: app.appliedAt,
                    status: app.status, // e.g. "APPLIED" -> need to handle casing in UI or helper
                    logo: app.job.company.substring(0, 2).toUpperCase()
                }));

                setApplications(mappedApps);
            } catch (err: any) {
                console.error(err);
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
                <div className="animate-spin text-blue-500">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Applications</h1>
                <p className="page-subtitle">Track the status of your submitted job applications.</p>
            </div>

            {applications.length > 0 ? (
                <div className="applications-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {applications.map((app) => (
                        <div key={app.id} className="job-card" style={{ padding: '20px' }}>
                            <div className="application-card-content">
                                <div className="application-info">
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '10px',
                                        backgroundColor: '#eff6ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#3b82f6',
                                        flexShrink: 0
                                    }}>
                                        {app.logo}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{app.jobTitle}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6b7280', fontSize: '14px', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {app.company}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Applied on {new Date(app.appliedAt || app.appliedDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="application-actions">
                                    {getStatusBadge(app.status)}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>View Details</button>
                                        <button className="action-btn" style={{ color: '#9ca3af' }}><MoreVertical size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-16" style={{ padding: '64px', textAlign: 'center' }}>
                    <div style={{ backgroundColor: '#f3f4f6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Briefcase size={32} style={{ color: '#9ca3af' }} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>No Applications Yet</h2>
                    <p style={{ color: '#6b7280', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                        You haven't applied to any jobs yet. Start exploring opportunities that match your skills!
                    </p>
                    <Link href="/dashboard/jobs" className="btn-primary">
                        Browse Available Jobs
                    </Link>
                </div>
            )}
        </div>
    );
}
