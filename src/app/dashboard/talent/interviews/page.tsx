'use client';

import { useState, useEffect } from 'react';
import {
    Video,
    Calendar,
    Clock,
    User,
    MoreVertical,
    Search,
    ChevronRight,
    MapPin,
    ExternalLink,
    VideoOff
} from 'lucide-react';

export default function CompanyInterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await fetch('/api/company/applications');
                if (res.ok) {
                    const data = await res.json();
                    type AppItem = { id: string; status: string; candidate?: { name?: string }; job?: { title?: string }; updatedAt: string };
                    const interviewApps = data.filter((app: AppItem) =>
                        ['Interview', 'INTERVIEW', 'Shortlisted', 'SHORTLISTED'].includes(app.status)
                    );

                    const mappedInterviews = interviewApps.map((app: AppItem) => {
                        const at = (app as { interviewScheduledAt?: string | null }).interviewScheduledAt
                            ? new Date((app as { interviewScheduledAt: string }).interviewScheduledAt)
                            : null;
                        return {
                            id: app.id,
                            candidateName: app.candidate?.name || 'Unknown Candidate',
                            jobTitle: app.job?.title || 'Unknown Job',
                            date: at ? at.toLocaleDateString() : `Last updated ${new Date(app.updatedAt).toLocaleDateString()}`,
                            time: at ? at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            type: 'Video',
                            status: app.status
                        };
                    });
                    setInterviews(mappedInterviews);
                }
            } catch (error) {
                console.error("Failed to fetch interviews", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, []);

    if (loading) {
        return <div className="p-12 text-center">Loading interviews...</div>;
    }

    return (
        <div className="dashboard-page-content">
            {/* Header */}
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Interviews Schedule</h1>
                    <p className="page-subtitle">View and manage your upcoming candidate evaluations.</p>
                </div>
                <button type="button" className="btn-primary" style={{ display: 'flex', gap: '8px' }}>
                    <Calendar size={18} />
                    Schedule Interview
                </button>
            </header>

            {/* Main Content Grid */}
            <div className="dashboard-content-grid">
                <div className="activity-section">
                    <div className="activity-header">
                        <h3 className="section-heading-text">Upcoming Interviews</h3>
                    </div>

                    <div className="activity-list">
                        {interviews.length > 0 ? (
                            interviews.map((interview) => (
                                <div key={interview.id} className="activity-item" style={{ alignItems: 'center' }}>
                                    <div className="activity-avatar" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                                        {interview.type === 'Video' ? <Video size={20} /> : <User size={20} />}
                                    </div>
                                    <div className="activity-content" style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <p style={{ margin: 0 }}><strong>{interview.candidateName}</strong> for <strong>{interview.jobTitle}</strong></p>
                                                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Calendar size={12} /> {interview.date}
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={12} /> {interview.time} (Last Update)
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    backgroundColor: '#ecfdf5',
                                                    color: '#10b981'
                                                }}>
                                                    {interview.status}
                                                </span>
                                                <button type="button" className="btn-secondary" style={{ padding: '8px 12px', height: 'auto', fontSize: '12px', display: 'flex', gap: '6px' }}>
                                                    Join Meeting <ExternalLink size={14} />
                                                </button>
                                                <button type="button" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                                <VideoOff size={40} strokeWidth={1.5} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                                <p style={{ color: '#6b7280' }}>No interviews scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-sidebar-col">
                    <div className="sidebar-widget">
                        <h3 className="widget-header">Interview Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Candidates</span>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>{interviews.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>Confirmed</span>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>{interviews.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
