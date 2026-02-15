'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Briefcase,
    Plus,
    Search,
    MoreVertical,
    MapPin,
    Clock,
    Users,
    ChevronRight,
    Filter,
    ArrowUpRight,
    SearchX
} from 'lucide-react';

type Job = {
    id: string;
    title: string;
    location: string;
    type: string;
    applicants: number;
    status: 'Active' | 'Closed' | 'Draft';
    postedDate: string;
};

const MOCK_JOBS: Job[] = [
    {
        id: '1',
        title: 'Senior Frontend Engineer',
        location: 'Remote',
        type: 'Full-time',
        applicants: 12,
        status: 'Active',
        postedDate: '2 days ago'
    },
    {
        id: '2',
        title: 'Product Designer',
        location: 'Hybrid, London',
        type: 'Full-time',
        applicants: 8,
        status: 'Active',
        postedDate: '5 hours ago'
    },
    {
        id: '3',
        title: 'Backend Engineer (Node.js)',
        location: 'Onsite, San Francisco',
        type: 'Contract',
        applicants: 5,
        status: 'Draft',
        postedDate: 'Not published'
    }
];

export default function CompanyJobsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredJobs = MOCK_JOBS.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="dashboard-page-content">
            {/* Header */}
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Manage Jobs</h1>
                    <p className="page-subtitle">Track, edit, and manage your open positions.</p>
                </div>
                <Link href="/dashboard/company/create-job" className="btn-primary">
                    <Plus size={18} />
                    Post New Job
                </Link>
            </header>

            {/* Filters & Search */}
            <div className="card" style={{ padding: '16px 24px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="input-wrapper" style={{ flex: 2, minWidth: '280px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by title or location..."
                            className="form-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '200px' }}>
                        <select
                            className="form-input"
                            style={{ paddingLeft: '12px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                            <option value="Draft">Draft</option>
                        </select>

                        <button className="btn-secondary" style={{ display: 'flex', gap: '8px', padding: '0 16px' }}>
                            <Filter size={18} />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div className="jobs-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <div key={job.id} className="card" style={{ padding: '24px', transition: 'all 0.2s ease', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{
                                        width: '52px',
                                        height: '52px',
                                        borderRadius: '12px',
                                        backgroundColor: '#f3f4f6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#3b82f6'
                                    }}>
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{job.title}</h3>
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                                                <MapPin size={14} /> {job.location}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                                                <Clock size={14} /> {job.type}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                                                <Users size={14} /> {job.applicants} Applicants
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '99px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: job.status === 'Active' ? '#ecfdf5' : job.status === 'Draft' ? '#f3f4f6' : '#fef2f2',
                                        color: job.status === 'Active' ? '#10b981' : job.status === 'Draft' ? '#6b7280' : '#ef4444'
                                    }}>
                                        {job.status}
                                    </span>
                                    <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ fontSize: '13px', color: '#9ca3af' }}>Posted {job.postedDate}</p>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button className="view-all-btn" style={{ fontSize: '14px' }}>Edit Job</button>
                                    <Link href={`/dashboard/company/jobs/${job.id}`} style={{
                                        textDecoration: 'none',
                                        color: '#3b82f6',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        View Pipeline <ArrowUpRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <div style={{ marginBottom: '20px', color: '#9ca3af' }}>
                            <SearchX size={48} strokeWidth={1.5} style={{ margin: '0 auto' }} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>No jobs found</h3>
                        <p style={{ color: '#6b7280', maxWidth: '320px', margin: '0 auto' }}>
                            We couldn't find any jobs matching your search parameters. Try adjusting your filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
