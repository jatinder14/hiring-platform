'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, CheckCircle, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

const mockJobs = [
    {
        id: "1",
        title: "Senior Full Stack Engineer",
        company: "TechNova Solutions",
        description: "We are looking for an experienced Full Stack Engineer to lead our core product team. You will be responsible for...",
        tags: ["Full Time", "Remote", "React", "Node.js"],
        location: "Remote",
        salary: "$120k - $150k"
    },
    {
        id: "2",
        title: "Product Designer",
        company: "Creative Studio",
        description: "Join our design team to create beautiful and intuitive user experiences. Proficiency in Figma and Adobe Suite required.",
        tags: ["Contract", "Hybrid", "UI/UX", "Figma"],
        location: "New York, NY",
        salary: "$90k - $110k"
    },
    {
        id: "3",
        title: "Backend Developer",
        company: "DataFlow Systems",
        description: "Seeking a backend specialist to optimize our high-performance data processing pipeline using Python and Go.",
        tags: ["Full Time", "On-site", "Python", "Go"],
        location: "Austin, TX",
        salary: "$130k - $160k"
    },
];

export default function JobsPage() {
    const [jobs, setJobs] = useState(mockJobs);
    const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        fullTime: true,
        contract: false,
        internship: false,
        category: 'All Categories',
        skills: ''
    });

    useEffect(() => {
        const fetchAppliedStatus = async () => {
            try {
                const res = await fetch('/api/applications');
                if (res.ok) {
                    const data = await res.json();
                    // Extract job IDs from the applications list
                    const appliedIds = data.map((app: any) => app.jobId);
                    setAppliedJobs(appliedIds);
                }
            } catch (error) {
                console.error("Failed to fetch application status", error);
            }
        };
        fetchAppliedStatus();
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
                <button className="btn-primary" style={{ width: '100%', marginBottom: '8px' }}>
                    Apply Filters
                </button>
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
                    {jobs.map((job) => {
                        const hasApplied = appliedJobs.includes(job.id);

                        return (
                            <div key={job.id} className="job-card">
                                <div className="job-info">
                                    <h3>{job.title}</h3>
                                    <span className="company-name">{job.company}</span>
                                    <div className="job-tags mb-4" style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {job.tags.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 text-gray-500 text-sm mb-4" style={{ display: 'flex', gap: '16px', color: '#6b7280', marginBottom: '16px', fontSize: '14px', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> {job.salary}</span>
                                    </div>
                                    <p style={{ color: '#4b5563', lineHeight: '1.5', fontSize: '15px' }}>{job.description}</p>
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
                    })}
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
