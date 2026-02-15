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

                const mappedCandidates = data.map((app: any) => ({
                    id: app.id,
                    name: app.candidate?.name || 'Unknown Candidate',
                    role: app.candidate?.email || 'N/A', // Using email as role placeholder or fetch role from user profile if available
                    jobApplied: app.job?.title || 'Unknown Job',
                    status: app.status,
                    experience: app.currentCTC ? `CTC: ${app.currentCTC}` : (app.noticePeriod || 'N/A'),
                    matchScore: 0, // Placeholder as we don't calculate score yet
                    avatar: app.candidate?.profileImageUrl
                }));

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
            <div className="card" style={{ padding: '16px 24px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="input-wrapper" style={{ flex: 1, minWidth: '280px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search candidates by name, email..."
                            className="form-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button className="btn-secondary" style={{ display: 'flex', gap: '8px', padding: '0 20px' }}>
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Candidates Table/List */}
            <div className="candidates-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (
                        <div key={candidate.id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '50%',
                                    backgroundColor: '#eff6ff',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '18px',
                                    overflow: 'hidden'
                                }}>
                                    {candidate.avatar ? (
                                        <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        candidate.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>{candidate.name}</h3>
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
                                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{candidate.role} • {candidate.experience}</p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Applied for <span style={{ color: '#4b5563', fontWeight: '600' }}>{candidate.jobApplied}</span></p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '99px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: ['Interview', 'INTERVIEW'].includes(candidate.status) ? '#eff6ff' : ['Offered', 'HIRED'].includes(candidate.status) ? '#ecfdf5' : '#f3f4f6',
                                        color: ['Interview', 'INTERVIEW'].includes(candidate.status) ? '#3b82f6' : ['Offered', 'HIRED'].includes(candidate.status) ? '#10b981' : '#6b7280'
                                    }}>
                                        {candidate.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#6b7280',
                                        cursor: 'pointer'
                                    }}>
                                        <Mail size={16} />
                                    </button>
                                    <button style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#6b7280',
                                        cursor: 'pointer'
                                    }}>
                                        <Calendar size={16} />
                                    </button>
                                    <Link href={`/dashboard/company/candidates/${candidate.id}`} style={{
                                        textDecoration: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        Profile <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                                <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                                    <MoreHorizontal size={20} />
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
