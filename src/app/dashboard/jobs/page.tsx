'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, CheckCircle, SlidersHorizontal, X, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';

type Job = {
    id: string;
    title: string;
    company: string;
    description: string;
    employmentType: string;
    location: string;
    salary: string;
    currency: string;
    skills: string[];
    experienceMin?: number | null;
    experienceMax?: number | null;
    createdAt: string;
};

type Application = {
    id: string;
    jobId: string;
    status: string;
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        fullTime: false,
        contract: false,
        internship: false,
        category: 'All Categories',
        skills: ''
    });

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [jobsRes, appsRes] = await Promise.all([
                fetch('/api/jobs'),
                fetch('/api/applications')
            ]);

            if (!jobsRes.ok) {
                const errorData = await jobsRes.json().catch(() => ({}));
                throw new Error((errorData as { error?: string }).error || 'Failed to fetch jobs');
            }

            const jobsData = await jobsRes.json();
            setJobs(jobsData);

            if (appsRes.ok) {
                const appsData: Application[] = await appsRes.json();
                setAppliedJobIds(new Set(appsData.map(app => app.jobId)));
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load jobs. Please try again later.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleClearFilters = () => {
        setFilters({
            fullTime: false,
            contract: false,
            internship: false,
            category: 'All Categories',
            skills: ''
        });
    };

    const filteredJobs = jobs.filter(job => {
        // Employment Type Filter (OR Logic)
        const activeTypes = [];
        if (filters.fullTime) activeTypes.push('Full-time');
        if (filters.contract) activeTypes.push('Contract');
        if (filters.internship) activeTypes.push('Internship');

        if (activeTypes.length > 0 && !activeTypes.includes(job.employmentType)) {
            return false;
        }

        // Skill Filter (Simple text match)
        if (filters.skills && !job.skills.some(skill => skill.toLowerCase().includes(filters.skills.toLowerCase()))) return false;

        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center">
                <div style={{ backgroundColor: '#fee2e2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <X size={32} style={{ color: '#ef4444' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Something went wrong</h2>
                <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 24px' }}>{error}</p>
                <button
                    type="button"
                    onClick={() => fetchData()}
                    className="btn-primary"
                    style={{ padding: '10px 32px' }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    const FilterContent = () => (
        <>
            <div className="filter-group">
                <h3 className="filter-title">Employment Type</h3>
                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.fullTime}
                            onChange={(e) => setFilters({ ...filters, fullTime: e.target.checked })}
                        />
                        Full Time
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.contract}
                            onChange={(e) => setFilters({ ...filters, contract: e.target.checked })}
                        />
                        Freelance / Contract
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.internship}
                            onChange={(e) => setFilters({ ...filters, internship: e.target.checked })}
                        />
                        Internship
                    </label>
                </div>
            </div>

            <div className="filter-group">
                <h3 className="filter-title">Category</h3>
                <select
                    className="form-input"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option>All Categories</option>
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Product</option>
                </select>
            </div>

            <div className="filter-group">
                <h3 className="filter-title">Skills</h3>
                <input
                    type="text"
                    placeholder="e.g. React, Python"
                    className="form-input"
                    value={filters.skills}
                    onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                />
            </div>

            <div className="filter-actions">
                {/* Filters are applied automatically in this implementation */}
                <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: '100%' }}
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </button>
            </div>
        </>
    );

    return (
        <div>
            <div className="page-header">
                <div className="page-header-content">
                    <div>
                        <h1 className="page-title">Find Your Next Role</h1>
                        <p className="page-subtitle">Browse open positions tailored for you.</p>
                    </div>
                    {/* Mobile Filter Button */}
                    <button
                        type="button"
                        className="filter-toggle-btn"
                        onClick={() => setIsFilterOpen(true)}
                        aria-label="Open filters"
                    >
                        <SlidersHorizontal size={20} />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            <div className="jobs-page-grid">
                {/* Job List - Now on LEFT */}
                <div className="job-list">
                    {jobs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 shadow-sm">
                            <div style={{ backgroundColor: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Briefcase size={32} style={{ color: '#3b82f6' }} />
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>No jobs available yet</h2>
                            <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                                We're currently matching new opportunities. Check back soon for new openings!
                            </p>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {filteredJobs.map((job) => {
                                const hasApplied = appliedJobIds.has(job.id);

                                return (
                                    <div key={job.id} className="job-card" style={{ cursor: 'default' }}>
                                        {/* Left Content Area */}
                                        <div className="job-info" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '0' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <h3 style={{
                                                    margin: 0,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: '1.4',
                                                    overflowWrap: 'anywhere',
                                                    wordBreak: 'break-word'
                                                }}>{job.title}</h3>
                                                <span className="company-name" style={{ margin: 0 }}>{job.company}</span>
                                            </div>

                                            {/* Tags Row */}
                                            <div className="job-tags">
                                                <span className="tag" style={{ border: '1px solid #dbeafe' }}>{job.employmentType}</span>
                                                {job.skills && job.skills.slice(0, 4).map(skill => (
                                                    <span key={skill} className="tag" style={{
                                                        backgroundColor: '#f8fafc',
                                                        color: '#475569',
                                                        border: '1px solid #e2e8f0'
                                                    }}>{skill}</span>
                                                ))}
                                            </div>

                                            {/* Meta Data Row */}
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '12px 20px',
                                                alignItems: 'center',
                                                marginTop: '4px',
                                                width: '100%'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px', minWidth: '0' }}>
                                                    <MapPin size={16} />
                                                    <span style={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: '180px'
                                                    }}>{job.location}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px', minWidth: '0' }}>
                                                    {job.currency === 'USD' ? <DollarSign size={16} /> : <Briefcase size={16} />}
                                                    <span style={{ fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>
                                                        {job.salary || "Competitive"} {job.currency && job.currency !== 'USD' ? job.currency : ''}
                                                    </span>
                                                </div>
                                                {(job.experienceMin !== null && job.experienceMin !== undefined) ? (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        backgroundColor: '#fffbeb',
                                                        color: '#92400e',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        border: '1px solid #fef3c7',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        <Clock size={16} />
                                                        <span>Experience: {job.experienceMin}{job.experienceMax ? `–${job.experienceMax}` : '+'} years</span>
                                                    </div>
                                                ) : null}
                                            </div>

                                            {/* Description Truncated */}
                                            <p style={{
                                                color: '#475569',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                                margin: '4px 0 0 0',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word'
                                            }}>
                                                {job.description}
                                            </p>
                                        </div>

                                        {/* Right Action Area */}
                                        <div className="job-actions">
                                            {hasApplied ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                                                    <button
                                                        type="button"
                                                        className="btn-secondary"
                                                        disabled
                                                        style={{
                                                            width: '100%',
                                                            height: '44px',
                                                            borderRadius: '12px',
                                                            backgroundColor: '#f1f5f9',
                                                            color: '#94a3b8',
                                                            border: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px',
                                                            fontSize: '15px',
                                                            fontWeight: '600',
                                                            cursor: 'not-allowed'
                                                        }}
                                                    >
                                                        <CheckCircle size={18} />
                                                        <span>Applied</span>
                                                    </button>
                                                    <Link
                                                        href="/dashboard/applications"
                                                        style={{
                                                            fontSize: '13px',
                                                            color: '#3b82f6',
                                                            textDecoration: 'none',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        View Application
                                                    </Link>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={`/dashboard/jobs/${job.id}/apply`}
                                                    className="btn-primary"
                                                    style={{
                                                        textDecoration: 'none',
                                                        width: '100%',
                                                        height: '44px',
                                                        borderRadius: '12px',
                                                        fontSize: '15px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Apply Now
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '12px' }}>No jobs found matching your criteria.</p>
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                style={{
                                    color: '#3b82f6',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop Filter Panel - Now on RIGHT */}
                <div className="filter-card card desktop-filter">
                    <h3 className="filter-header">Filters</h3>
                    <FilterContent />
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {isFilterOpen && (
                <>
                    <div
                        className="filter-drawer-overlay"
                        onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="filter-drawer">
                        <div className="filter-drawer-header">
                            <h3>Filters</h3>
                            <button
                                type="button"
                                className="filter-drawer-close"
                                onClick={() => setIsFilterOpen(false)}
                                aria-label="Close filters"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="filter-drawer-content">
                            <FilterContent />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
