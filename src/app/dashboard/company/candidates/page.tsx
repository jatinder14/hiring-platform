'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Calendar,
    ChevronRight,
    Star,
    ArrowUpRight,
    UserX
} from 'lucide-react';
import Link from 'next/link';

type Candidate = {
    id: string;
    name: string;
    role: string;
    jobApplied: string;
    status: 'New' | 'Interview' | 'Offered' | 'Rejected';
    experience: string;
    matchScore: number;
    avatar?: string;
};

export default function CompanyCandidatesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await fetch('/api/company/applications');
                if (!res.ok) throw new Error('Failed to fetch candidates');
                const data = await res.json();

                const mappedCandidates = data.map((app: any) => {
                    // Cleaner name handling
                    const firstName = app.candidate?.name?.trim();
                    const candidateName = firstName || 'Anonymous Candidate';
                    const candidateEmail = app.candidate?.email || '';

                    // Better salary/CTC display
                    let experienceText = '';
                    if (app.currentCTC && app.currentCTC !== '0' && app.currentCTC !== '000') {
                        experienceText = `${app.currentCurrency || '₹'} ${app.currentCTC}`;
                        if (!experienceText.includes('p.a.')) experienceText += ' p.a.';
                    } else if (app.noticePeriod) {
                        experienceText = `Notice: ${app.noticePeriod}`;
                    } else {
                        experienceText = 'Applied';
                    }

                    return {
                        id: app.id,
                        name: candidateName,
                        role: candidateEmail,
                        jobApplied: app.job?.title || 'Open Position',
                        status: app.status || 'NEW',
                        experience: experienceText,
                        matchScore: 0,
                        avatar: app.candidate?.profileImageUrl
                    };
                });

                setCandidates(mappedCandidates);
            } catch (err) {
                console.error(err);
                setError('Failed to load candidates');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <div className="p-8 text-center">Loading candidates...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="dashboard-page-content">
            {/* Header */}
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Manage Talent</h1>
                    <p className="page-subtitle">Track and evaluate candidates in your pipeline.</p>
                </div>
            </header>

            {/* Controls */}
            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="business-filter-bar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="search-wrapper" style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Search candidates by name, email..."
                            className="form-input"
                            style={{ paddingLeft: '40px', width: '100%' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button className="btn-secondary" style={{ display: 'flex', gap: '8px', height: '44px', padding: '0 20px', alignItems: 'center' }}>
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Candidates Table/List */}
            <div className="candidates-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (
                        <div key={candidate.id} className="card candidate-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', border: '1px solid #eef2f6' }}>
                            <div className="candidate-main-info" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1' }}>
                                <div className="candidate-avatar" style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    backgroundColor: '#eff6ff',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '20px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                                }}>
                                    {candidate.avatar ? (
                                        <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        candidate.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="candidate-text-data">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 }}>{candidate.name}</h3>
                                        {candidate.matchScore > 0 && (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#f59e0b',
                                                backgroundColor: '#fffbeb',
                                                padding: '2px 8px',
                                                borderRadius: '99px'
                                            }}>
                                                <Star size={10} fill="#f59e0b" /> {candidate.matchScore}% Match
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '2px 0', fontWeight: '500' }}>
                                        {candidate.role}
                                        <span style={{ margin: '0 8px', color: '#d1d5db' }}>•</span>
                                        <span style={{ color: '#10b981' }}>{candidate.experience}</span>
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>Applied for <span style={{ color: '#3b82f6', fontWeight: '600' }}>{candidate.jobApplied}</span></p>
                                </div>
                            </div>

                            <div className="candidate-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div className="status-badge-container">
                                    <span style={{
                                        padding: '6px 14px',
                                        borderRadius: '99px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        backgroundColor: ['Interview', 'INTERVIEW'].includes(candidate.status) ? '#eff6ff' : ['Offered', 'HIRED', 'Offered'].includes(candidate.status) ? '#ecfdf5' : '#f3f4f6',
                                        color: ['Interview', 'INTERVIEW'].includes(candidate.status) ? '#3b82f6' : ['Offered', 'HIRED', 'Offered'].includes(candidate.status) ? '#10b981' : '#6b7280',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {candidate.status}
                                    </span>
                                </div>
                                <div className="candidate-buttons" style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px' }} title="Send Email">
                                        <Mail size={18} />
                                    </button>
                                    <button className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px' }} title="Schedule Interview">
                                        <Calendar size={18} />
                                    </button>
                                    <Link href={`/dashboard/company/candidates/${candidate.id}`} className="btn-primary btn-profile" style={{
                                        textDecoration: 'none',
                                        padding: '0 20px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        Profile <ArrowUpRight size={16} />
                                    </Link>
                                </div>
                                <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '8px' }}>
                                    <MoreHorizontal size={22} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <UserX size={48} strokeWidth={1.5} style={{ margin: '0 auto', color: '#9ca3af', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>No candidates found</h3>
                        <p style={{ color: '#6b7280' }}>Candidates who apply to your jobs will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
