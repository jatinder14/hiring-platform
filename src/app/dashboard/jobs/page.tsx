'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, CheckCircle, SlidersHorizontal, X, Loader2 } from 'lucide-react';
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

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch jobs and applications in parallel
                const [jobsRes, appsRes] = await Promise.all([
                    fetch('/api/jobs'),
                    fetch('/api/applications') // To check which jobs user applied to
                ]);

                if (!jobsRes.ok) throw new Error('Failed to fetch jobs');

                const jobsData = await jobsRes.json();
                setJobs(jobsData);

                // If user is logged in, appsRes might be ok, otherwise 401
                if (appsRes.ok) {
                    const appsData: Application[] = await appsRes.json();
                    const appliedIds = new Set(appsData.map(app => app.jobId));
                    setAppliedJobIds(appliedIds);
                }
            } catch (err: any) {
                console.error("Error loading jobs:", err);
                setError('Failed to load jobs. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

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
        // Employment Type Filter
        if (filters.fullTime && job.employmentType !== 'Full-time') return false;
        if (filters.contract && job.employmentType !== 'Contract') return false;
        if (filters.internship && job.employmentType !== 'Internship') return false;

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
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => {
                            const hasApplied = appliedJobIds.has(job.id);

                            return (
                                <div key={job.id} className="job-card">
                                    <div className="job-info">
                                        <h3>{job.title}</h3>
                                        <span className="company-name">{job.company}</span>
                                        <div className="job-tags mb-4" style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span className="tag text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">{job.employmentType}</span>
                                            {job.skills && job.skills.slice(0, 3).map(skill => (
                                                <span key={skill} className="tag text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{skill}</span>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 text-gray-500 text-sm mb-4" style={{ display: 'flex', gap: '16px', color: '#6b7280', marginBottom: '16px', fontSize: '14px', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> {job.salary || "Competitive"} {job.currency || ""}</span>
                                        </div>
                                        <p style={{ color: '#4b5563', lineHeight: '1.5', fontSize: '15px' }} className="line-clamp-3">
                                            {job.description && job.description.length > 150 ? job.description.substring(0, 150) + "..." : job.description}
                                        </p>
                                    </div>
                                    <div className="job-actions">
                                        {hasApplied ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                                                <button
                                                    className="btn-secondary"
                                                    disabled
                                                    style={{
                                                        cursor: 'not-allowed',
                                                        backgroundColor: '#f3f4f6',
                                                        borderColor: '#e5e7eb',
                                                        color: '#9ca3af',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <CheckCircle size={16} style={{ flexShrink: 0 }} />
                                                    <span>Applied</span>
                                                </button>
                                                <Link href="/dashboard/applications" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', textAlign: 'center' }}>
                                                    View Application
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link href={`/dashboard/jobs/${job.id}/apply`} className="btn-primary" style={{ textDecoration: 'none' }}>
                                                Apply
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No jobs found matching your criteria.</p>
                            <button onClick={handleClearFilters} className="text-blue-500 underline mt-2">Clear filters</button>
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
