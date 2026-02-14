'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Briefcase, MapPin, DollarSign, UploadCloud,
    ChevronLeft, CheckCircle, FileText, Globe
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

// Mock data for initial implementation
const mockJobs = [
    {
        id: "1",
        title: "Senior Full Stack Engineer",
        company: "TechNova Solutions",
        description: "We are looking for an experienced Full Stack Engineer to lead our core product team. You will be responsible for designing and implementing scalable web applications, mentoring junior developers, and collaborating cross-functional teams to deliver high-quality software solutions.\n\nRequirements:\n- 5+ years of experience with React and Node.js\n- Strong understanding of system architecture\n- Experience with AWS and DevOps practices\n- Excellent communication skills",
        employmentType: "Full Time",
        location: "Remote",
        salary: "120,000 - 150,000",
        currency: "USD"
    }
];

export default function ApplyPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState(mockJobs[0]); // Fallback to mock
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resume, setResume] = useState<File | null>(null);
    const [motivationData, setMotivationData] = useState<any>(null);

    // Form data
    const [formData, setFormData] = useState({
        currentCTC: '',
        expectedCTC: '',
        noticePeriod: 'Immediate',
        city: '',
    });

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
        setIsLoading(true);

        try {
            // In a real app, we would upload the file to S3 first and get a URL
            // const resumeUrl = await uploadToS3(resume);

            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: params.id,
                    resumeUrl: "mock_resume_url.pdf", // placeholder
                    motivation: motivationData,
                    ...formData
                })
            });

            if (response.ok) {
                // Update local storage for demo purposes (Applied state on Jobs list)
                const applied = JSON.parse(localStorage.getItem('applied_jobs') || '[]');
                if (!applied.includes(params.id)) {
                    applied.push(params.id);
                    localStorage.setItem('applied_jobs', JSON.stringify(applied));
                }

                // Also update the detailed applications list for the demo
                const fullApps = JSON.parse(localStorage.getItem('user_applications') || '[]');
                fullApps.push({
                    id: Math.random().toString(36).substr(2, 9),
                    jobId: params.id,
                    jobTitle: job.title,
                    company: job.company,
                    appliedAt: new Date().toISOString(),
                    status: "Applied",
                    logo: job.company.substring(0, 2).toUpperCase()
                });
                localStorage.setItem('user_applications', JSON.stringify(fullApps));

                setIsSubmitted(true);
            } else {
                alert("Failed to submit application. Please try again.");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

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
                                <Editor
                                    placeholder="Tell us why you're a great fit..."
                                    onChange={(data) => setMotivationData(data)}
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
                                disabled={isLoading}
                            >
                                {isLoading ? "Submitting..." : "Complete Submission"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
