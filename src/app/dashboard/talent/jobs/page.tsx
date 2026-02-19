'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRecruiterBasePath } from '@/components/RecruiterBasePathContext';
import {
    Eye,
    Pencil,
    Trash2,
    Search,
    Plus,
    MapPin,
    Briefcase,
    Users,
    Calendar,
    Clock,
    Filter,
    AlertCircle,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

export default function ManageJobsPage() {
    const base = useRecruiterBasePath();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [jobToDelete, setJobToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch('/api/company/jobs');
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data);
                }
            } catch (error) {
                console.error('Failed to fetch jobs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleDelete = async () => {
        if (!jobToDelete) return;

        try {
            const res = await fetch(`/api/company/jobs/${jobToDelete}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setJobs(jobs.filter(job => job.id !== jobToDelete));
                setJobToDelete(null);
                toast.success('Job deleted successfully');
            } else {
                toast.error('Failed to delete job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('Error deleting job');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const filteredJobs = jobs.filter(job => {
        const titleMatch = job.title?.toLowerCase() || '';
        const locMatch = job.location?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = titleMatch.includes(searchLower) || locMatch.includes(searchLower);

        let matchesStatus = true;
        if (statusFilter !== 'All') {
            if (statusFilter === 'Active') matchesStatus = job.status === 'ACTIVE';
            else if (statusFilter === 'Draft') matchesStatus = job.status === 'DRAFT';
            else if (statusFilter === 'Inactive') matchesStatus = ['CLOSED', 'ARCHIVED'].includes(job.status);
        }

        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeStyle = (status: string) => {
        const s = status || 'DRAFT';
        const baseStyle = {
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'capitalize' as const,
            display: 'inline-block'
        };

        switch (s) {
            case 'ACTIVE':
                return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
            case 'DRAFT':
                return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
            case 'CLOSED':
            case 'ARCHIVED':
                return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
            default:
                return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const style = getStatusBadgeStyle(status);
        let label = status ? status.toLowerCase() : 'Draft';
        if (status === 'ACTIVE' || status === 'DRAFT') label = status.charAt(0) + status.slice(1).toLowerCase();
        if (status === 'CLOSED' || status === 'ARCHIVED') label = 'Inactive';

        return <span style={style}>{label}</span>;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="manage-jobs-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div className="manage-jobs-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ minWidth: '0', flex: '1' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Manage Jobs</h1>
                    <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>Track and manage your diverse hiring pipeline.</p>
                </div>
                <Link href={`${base}/create-job`} className="btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus size={18} />
                    Post New Job
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="business-filter-bar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div className="search-wrapper" style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Search jobs by title or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="status-filter-wrapper" style={{ position: 'relative', flex: '0 0 200px', width: '100%', maxWidth: '100%' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1, pointerEvents: 'none' }} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '36px', width: '100%', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <div key={job.id} className="card job-card" style={{ padding: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
                            {/* Job Info */}
                            <div style={{ flex: '1', minWidth: '0' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#111827',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word'
                                    }}>{job.title}</h3>
                                    <StatusBadge status={job.status} />
                                </div>

                                <div className="manage-job-meta">
                                    {job.location && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={14} />
                                            <span>{job.location}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={14} />
                                        <span>{job._count?.applications || 0} Applicants</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} />
                                        <span>Posted {formatDate(job.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="job-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Link
                                    href={`${base}/jobs/${job.id}`}
                                    className="btn-primary"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                                        borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                                        flex: '1', minWidth: '100px', justifyContent: 'center'
                                    }}
                                >
                                    <Eye size={16} /> View
                                </Link>

                                <Link
                                    href={`${base}/jobs/${job.id}/edit`}
                                    className="btn-secondary"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                                        borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                                        flex: '1', minWidth: '100px', justifyContent: 'center'
                                    }}
                                >
                                    <Pencil size={16} /> Edit
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setJobToDelete(job.id)}
                                    className="btn-secondary"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                                        borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#dc2626', borderColor: '#fecaca',
                                        flex: '1', minWidth: '100px', justifyContent: 'center'
                                    }}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card" style={{ padding: '64px', textAlign: 'center', borderStyle: 'dashed' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Search size={24} style={{ color: '#9ca3af' }} />
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '500', color: '#111827' }}>No jobs found</h3>
                        <p style={{ margin: 0, color: '#6b7280' }}>
                            No job postings matched your search. Try adjusting filters or post a new job.
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {jobToDelete && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '24px', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>Delete Job Posting</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>This action cannot be undone.</p>
                            </div>
                        </div>

                        <p style={{ margin: '0 0 24px', color: '#4b5563', lineHeight: '1.5' }}>
                            Are you sure you want to delete <span style={{ fontWeight: '600', color: '#111827' }}>
                                {jobs.find(j => j.id === jobToDelete)?.title || 'this job'}
                            </span>?
                            All associated data will be permanently removed.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setJobToDelete(null)}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db',
                                    backgroundColor: '#ffffff', color: '#374151', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    backgroundColor: '#dc2626', color: '#ffffff', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                                }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
