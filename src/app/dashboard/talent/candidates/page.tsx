'use client';

import { useState, useEffect } from 'react';
import { useRecruiterBasePath } from '@/components/RecruiterBasePathContext';
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
    status: string;
    experience: string;
    matchScore: number;
    avatar?: string;
    appliedAt: string;
};

export default function CompanyCandidatesPage() {
    const base = useRecruiterBasePath();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchCandidates = async () => {
            try {
                setError('');
                setIsLoading(true);
                let url = '/api/company/applications?';
                if (statusFilter) url += `status=${statusFilter}&`;
                if (fromDate) url += `fromDate=${fromDate}&`;
                if (toDate) url += `toDate=${toDate}&`;

                const res = await fetch(url, { signal });
                if (!res.ok) {
                    // Check if it's a JSON response before parsing
                    const contentType = res.headers.get("content-type");
                    let errorMessage = 'Failed to fetch candidates';
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        errorMessage = errorData.error || errorMessage;
                    }
                    throw new Error(errorMessage);
                }
                const data = await res.json();

                type AppItem = { id: string; candidate?: { name?: string; email?: string; profileImageUrl?: string | null }; job?: { title?: string }; currentCTC?: string; currentCurrency?: string; noticePeriod?: string; status?: string; appliedAt: string };
                const mappedCandidates = data.map((app: AppItem) => {
                    const firstName = app.candidate?.name?.trim();
                    const candidateName = firstName || 'Anonymous Candidate';
                    const candidateEmail = app.candidate?.email || '';

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
                        status: app.status || 'APPLIED',
                        experience: experienceText,
                        matchScore: 0,
                        avatar: app.candidate?.profileImageUrl,
                        appliedAt: app.appliedAt
                    };
                });

                setCandidates(mappedCandidates);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                console.error(err);
                setError(err instanceof Error ? err.message : 'Failed to load candidates');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();

        return () => controller.abort();
    }, [statusFilter, fromDate, toDate]);

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
            <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
                <div className="business-filter-bar">
                    <div className="search-wrapper">
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

                    <button
                        type="button"
                        className={`btn-secondary btn-filter-trigger ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            display: 'flex',
                            gap: '8px',
                            height: '44px',
                            padding: '0 20px',
                            alignItems: 'center',
                            backgroundColor: showFilters ? '#f3f4f6' : 'transparent',
                            borderColor: showFilters ? '#3b82f6' : '#e5e7eb'
                        }}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="filters-expanded" style={{
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid #f3f4f6',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        <div className="filter-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Status</label>
                            <select
                                className="form-input"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">All Applications</option>
                                <option value="Active">Active</option>
                                <option value="Withdrawn">Withdrawn</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Applied After</label>
                            <input
                                type="date"
                                className="form-input"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="filter-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Applied Before</label>
                            <input
                                type="date"
                                className="form-input"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter('');
                                    setFromDate('');
                                    setToDate('');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#3b82f6',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    padding: '10px 0'
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Candidates List */}
            <div className="candidates-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (
                        <div key={candidate.id} className="hireu-candidate-card">
                            {/* Left Side: Information */}
                            <div className="candidate-content-left">
                                <div className="candidate-avatar-wrapper">
                                    <div className="candidate-avatar candidate-avatar-v2" style={{
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
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                                    }}>
                                        {candidate.avatar ? (
                                            <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            candidate.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </div>

                                <div className="candidate-main-info">
                                    <div className="candidate-name-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <h3 style={{ margin: 0 }}>{candidate.name}</h3>
                                        <span
                                            className={`status-badge ${['INTERVIEW', 'SHORTLISTED', 'APPLIED'].includes(candidate.status) ? 'active' :
                                                candidate.status === 'WITHDRAWN' ? 'withdrawn' : 'inactive'
                                                }`}
                                            style={{
                                                fontSize: '10px',
                                                padding: '4px 10px',
                                                borderRadius: '99px',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                height: 'fit-content'
                                            }}
                                        >
                                            {candidate.status === 'APPLIED' ? 'ACTIVE' :
                                                candidate.status === 'SHORTLISTED' ? 'SHORTLISTED' :
                                                    candidate.status === 'INTERVIEW' ? 'INTERVIEW' : candidate.status}
                                        </span>
                                    </div>
                                    <span className="candidate-email-text">{candidate.role}</span>

                                    <div className="candidate-meta-flex">
                                        <div className="meta-pill">
                                            <span style={{ color: '#10b981', fontWeight: '700' }}>{candidate.experience}</span>
                                        </div>
                                        <div className="meta-pill">
                                            <span style={{ color: '#64748b' }}>Applied for:</span>
                                            <span style={{ color: '#3b82f6', fontWeight: '600' }}>{candidate.jobApplied}</span>
                                        </div>
                                        {candidate.matchScore > 0 && (
                                            <div className="meta-pill" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                                                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                                <span style={{ color: '#d97706', fontWeight: '700' }}>{candidate.matchScore}% Match</span>
                                            </div>
                                        )}
                                        <div className="meta-pill">
                                            <span style={{ color: '#94a3b8' }}>Applied On:</span>
                                            <span style={{ color: '#475569', fontWeight: '500' }}>
                                                {new Date(candidate.appliedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Status & Actions */}
                            <div className="candidate-actions-right">


                                <div className="action-tools">
                                    <div className="icon-row">
                                        <button type="button" className="tool-btn" title="Send Email">
                                            <Mail size={18} />
                                        </button>
                                        <button type="button" className="tool-btn" title="Schedule Interview">
                                            <Calendar size={18} />
                                        </button>
                                    </div>
                                    <Link href={`${base}/candidates/${candidate.id}`} className="profile-link-btn">
                                        View Profile <ArrowUpRight size={18} />
                                    </Link>
                                </div>
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
