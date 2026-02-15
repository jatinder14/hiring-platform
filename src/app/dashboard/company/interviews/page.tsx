'use client';

import { useState } from 'react';
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

type Interview = {
    id: string;
    candidateName: string;
    jobTitle: string;
    date: string;
    time: string;
    type: 'Video' | 'Onsite' | 'Technical';
    status: 'Upcoming' | 'Completed' | 'Cancelled';
};

const MOCK_INTERVIEWS: Interview[] = [
    {
        id: '1',
        candidateName: 'John Doe',
        jobTitle: 'Senior Frontend Engineer',
        date: 'Today, Oct 24',
        time: '2:00 PM - 3:00 PM',
        type: 'Video',
        status: 'Upcoming'
    },
    {
        id: '2',
        candidateName: 'Jane Smith',
        jobTitle: 'Product Designer',
        date: 'Tomorrow, Oct 25',
        time: '11:00 AM - 12:00 PM',
        type: 'Technical',
        status: 'Upcoming'
    }
];

export default function CompanyInterviewsPage() {
    return (
        <div className="dashboard-page-content">
            {/* Header */}
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Interviews Schedule</h1>
                    <p className="page-subtitle">View and manage your upcoming candidate evaluations.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', gap: '8px' }}>
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
                        {MOCK_INTERVIEWS.length > 0 ? (
                            MOCK_INTERVIEWS.map((interview) => (
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
                                                        <Clock size={12} /> {interview.time}
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
                                                <button className="btn-secondary" style={{ padding: '8px 12px', height: 'auto', fontSize: '12px', display: 'flex', gap: '6px' }}>
                                                    Join Meeting <ExternalLink size={14} />
                                                </button>
                                                <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
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
                                <p style={{ color: '#6b7280' }}>No interviews scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-sidebar-col">
                    <div className="sidebar-widget">
                        <h3 className="widget-header">Interview Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>Total this week</span>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>12</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>Completed</span>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>8</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
