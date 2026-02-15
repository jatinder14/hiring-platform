'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Briefcase, MapPin, DollarSign, UploadCloud,
    ChevronLeft, CheckCircle, FileText, Loader2
} from 'lucide-react';
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
};

export default function ApplyPage() {
    const params = useParams();
    const router = useRouter();

    // State
    const [job, setJob] = useState<Job | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resume, setResume] = useState<File | null>(null);
    const [motivationData, setMotivationData] = useState<string>('');
    const [fetchError, setFetchError] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        currentCTC: '',
        expectedCTC: '',
        noticePeriod: 'Immediate',
        city: '',
    });

    // Fetch Job Data
    useEffect(() => {
        const fetchJob = async () => {
            if (!params?.id) return;

            const jobId = Array.isArray(params.id) ? params.id[0] : params.id;

            try {
                // In a real scenario, you might have a dedicated endpoint for single job details
                // If /api/jobs returns a list, we might need to filter or fetch a specific one
                // Given previous context, let's assume we can fetch specific job or we fetch list and find.
                // Ideally: fetch(`/api/jobs/${jobId}`)

                // Let's rely on the public jobs API. If it doesn't support ID, we might need to update it. 
                // However, usually REST APIs support /api/jobs/:id.
                // Let's try to fetch all and find, OR if we made a specific endpoint. 
                // Looking at previous interactions, we haven't explicitly seen /api/jobs/[id] GET for public.
                // But typically it should be there. Let's try to fetch it.
                // If it fails, we will fallback to fetching all and filtering (backup plan).

                // Let's try fetching the specific job directly if the endpoint exists, 
                // otherwise we might need to use the 'GET /api/jobs' and filter.
                // Safest bet without checking backend code right now: Try specific known pattern first.

                const res = await fetch(`/api/jobs/${jobId}`, { cache: 'no-store' });

                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setJob(data);
                    } else {
                        setFetchError('Job not found');
                    }
                } else {
                    // Fallback: This might occur if the specific ID route isn't implemented for GET public
                    // Let's try fetching all active jobs and filtering (not efficient but works for MVP)
                    const resAll = await fetch('/api/jobs');
                    if (resAll.ok) {
                        const allJobs: Job[] = await resAll.json();
                        const foundJob = allJobs.find(j => j.id === jobId);
                        if (foundJob) {
                            setJob(foundJob);
                        } else {
                            setFetchError('Job not found or not active');
                        }
                    } else {
                        throw new Error('Failed to load job details');
                    }
                }
            } catch (err: any) {
                console.error("Error fetching job:", err);
                setFetchError('Failed to load job details. Please try again.');
            } finally {
                setIsFetching(false);
            }
        };

        fetchJob();
    }, [params?.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!params?.id) {
            alert("Invalid Job URL");
            return;
        }

        const jobId = Array.isArray(params.id) ? params.id[0] : params.id;

        setIsSubmitting(true);

        try {
            // In a real app, we would upload the file to S3 first and get a URL
            // const resumeUrl = await uploadToS3(resume);

            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: jobId,
                    resumeUrl: "mock_resume_url.pdf", // placeholder
                    motivation: motivationData,
                    ...formData
                })
            });

            if (response.ok) {
                // Update local storage for demo purposes (Applied state on Jobs list)
                const applied = JSON.parse(localStorage.getItem('applied_jobs') || '[]');
                if (!applied.includes(jobId)) {
                    applied.push(jobId);
                    localStorage.setItem('applied_jobs', JSON.stringify(applied));
                }

                // Also update the detailed applications list for the demo
                const fullApps = JSON.parse(localStorage.getItem('user_applications') || '[]');
                const newApp = {
                    id: Math.random().toString(36).substr(2, 9),
                    jobId: jobId,
                    jobTitle: job?.title || 'Unknown Role',
                    company: job?.company || 'Unknown Company',
                    appliedAt: new Date().toISOString(),
                    status: "Applied",
                    logo: job?.company ? job.company.substring(0, 2).toUpperCase() : '??'
                };

                fullApps.push(newApp);
                localStorage.setItem('user_applications', JSON.stringify(fullApps));

                setIsSubmitted(true);
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to submit application. Please try again.");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (fetchError || !job) {
        return (
            <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                    <Briefcase size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Job Not Found</h2>
                <p className="text-gray-600 mb-6">{fetchError || "The job you are applying for is no longer available."}</p>
                <Link href="/dashboard/jobs" className="btn-primary inline-flex items-center gap-2">
                    <ChevronLeft size={18} /> Back to Jobs
                </Link>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-vh-100" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card text-center" style={{ maxWidth: '500px', padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#10b981', marginBottom: '24px' }}>
                        <CheckCircle size={64} style={{ margin: '0 auto' }} />
                    </div>
                    <h1 className="page-title">Application Submitted Successfully</h1>
                    <p className="page-subtitle" style={{ marginBottom: '32px' }}>
                        Your application for <strong>{job.title}</strong> has been sent to the employer.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link href="/dashboard/applications" className="btn-primary">
                            View My Applications
                        </Link>
                        <Link href="/dashboard/jobs" className="btn-secondary">
                            Browse More Jobs
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="apply-page">
            <Link href="/dashboard/jobs" className="flex items-center gap-2 text-muted mb-6" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', textDecoration: 'none', marginBottom: '24px', fontSize: '14px' }}>
                <ChevronLeft size={16} /> Back to Jobs
            </Link>

            <div className="apply-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                {/* Left Side: Job Details */}
                <div className="job-details-section">
                    <div className="card" style={{ padding: '32px' }}>
                        <div className="mb-6" style={{ marginBottom: '24px' }}>
                            <span className="tag" style={{ marginBottom: '12px', display: 'inline-block' }}>{job.employmentType}</span>
                            <h1 className="page-title" style={{ fontSize: '32px' }}>{job.title}</h1>
                            <div className="flex gap-4 text-muted mt-2" style={{ display: 'flex', gap: '16px', color: '#6b7280' }}>
                                <span className="flex items-center gap-1"><Briefcase size={16} /> {job.company}</span>
                                <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                                <span className="flex items-center gap-1"><DollarSign size={16} /> {job.salary} {job.currency}</span>
                            </div>
                        </div>

                        <div className="section-title">Job Description</div>
                        <div className="job-desc-content" style={{ color: '#4b5563', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                            {job.description}
                        </div>
                    </div>
                </div>

                {/* Right Side: Application Form */}
                <div className="application-form-section">
                    <div className="card" style={{ padding: '32px', position: 'sticky', top: '40px' }}>
                        <h2 className="section-title">Apply for this role</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Resume / CV (PDF, MAX 5MB)</label>
                                <div
                                    className="resume-upload-area"
                                    style={{ padding: '24px', borderStyle: 'dashed' }}
                                    onClick={() => document.getElementById('resume-upload')?.click()}
                                >
                                    <UploadCloud size={32} className="text-muted" style={{ margin: '0 auto 8px' }} />
                                    {resume ? (
                                        <div className="flex items-center gap-2 justify-center" style={{ color: '#3b82f6', fontWeight: '500' }}>
                                            <FileText size={16} /> {resume.name}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                            Click to upload PDF
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        hidden
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Motivation Letter / Why you?</label>
                                <textarea
                                    className="form-input"
                                    rows={6}
                                    placeholder="Tell us why you're a great fit..."
                                    onChange={(e) => setMotivationData(e.target.value)}
                                    value={motivationData || ''}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Current CTC (Annual)</label>
                                <input
                                    type="text"
                                    name="currentCTC"
                                    className="form-input"
                                    placeholder="e.g. 100,000"
                                    value={formData.currentCTC}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Expected CTC (Annual)</label>
                                <input
                                    type="text"
                                    name="expectedCTC"
                                    className="form-input"
                                    placeholder="e.g. 150,000"
                                    value={formData.expectedCTC}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notice Period</label>
                                <select
                                    name="noticePeriod"
                                    className="form-input"
                                    value={formData.noticePeriod}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Immediate">Immediate</option>
                                    <option value="15 Days">15 Days</option>
                                    <option value="30 Days">30 Days</option>
                                    <option value="60 Days">60 Days</option>
                                    <option value="90 Days">90 Days</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Current City</label>
                                <input
                                    type="text"
                                    name="city"
                                    className="form-input"
                                    placeholder="e.g. New York, NY"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '16px' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Complete Submission"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
