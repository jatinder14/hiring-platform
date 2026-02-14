'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle, ChevronRight, X, Plus } from 'lucide-react';
// import { createJob } from '@/app/actions/job';

type JobData = {
    title: string;
    employmentType: string;
    location: string;
    salaryMin: string;
    salaryMax: string;
    currency: string;
    workMode: 'Remote' | 'Onsite' | 'Hybrid';
    skills: string[];
    description: string;
    experience: string;
    requirements: string;
};

const STEPS = [
    { number: 1, title: 'Job Details', subtitle: 'Basic information' },
    { number: 2, title: 'Review & Publish', subtitle: 'Final check' },
];

export default function CreateJobForm() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<JobData>({
        title: '',
        employmentType: 'Full-time',
        location: '',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        workMode: 'Remote',
        skills: [],
        description: '',
        experience: '0-2 years',
        requirements: '',
    });

    const [skillInput, setSkillInput] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSkill = () => {
        const skill = skillInput.trim();
        if (skill && !formData.skills.includes(skill)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleNext = () => {
        if (currentStep < 2) setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log("Submitting Job:", formData);
            router.push('/dashboard/company/jobs');
        } catch (error) {
            console.error("Failed to post job", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStep1Valid = formData.title && formData.location && formData.salaryMin && formData.description;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Stepper Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '100%', height: '4px', backgroundColor: '#e5e7eb', zIndex: -1, borderRadius: '99px' }}></div>
                    <div
                        style={{
                            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '4px', backgroundColor: '#3b82f6', zIndex: -1, borderRadius: '99px', transition: 'width 0.3s',
                            width: currentStep === 1 ? '50%' : '100%'
                        }}
                    ></div>

                    {STEPS.map((step) => {
                        const isActive = currentStep >= step.number;
                        const isCurrent = currentStep === step.number;
                        const circleStyle = isActive ?
                            { backgroundColor: '#3b82f6', borderColor: '#3b82f6', color: 'white' } :
                            { backgroundColor: 'white', borderColor: '#d1d5db', color: '#6b7280' };

                        return (
                            <div key={step.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f9fafb', padding: '0 8px' }}>
                                <div
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid', transition: 'all 0.3s',
                                        ...circleStyle
                                    }}
                                >
                                    {isActive && !isCurrent && step.number < currentStep ? <CheckCircle size={20} /> : step.number}
                                </div>
                                <span style={{ marginTop: '8px', fontSize: '14px', fontWeight: '600', color: isActive ? '#3b82f6' : '#6b7280' }}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card">
                {/* Step 1: Job Details */}
                {currentStep === 1 && (
                    <div className="animate-fadeIn">
                        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Job Information</h2>
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>Fill in the details about the position.</p>
                        </div>

                        <div className="form-grid">
                            {/* Job Title */}
                            <div className="form-group full-width">
                                <label className="form-label">Job Title <span className="text-danger">*</span></label>
                                <div className="input-wrapper">
                                    <Briefcase size={18} />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Senior Frontend Engineer"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {/* Employment Type */}
                            <div className="form-group">
                                <label className="form-label">Employment Type</label>
                                <select
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleInputChange}
                                    className="form-input"
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                    <option>Freelance</option>
                                </select>
                            </div>

                            {/* Work Mode */}
                            <div className="form-group">
                                <label className="form-label">Work Mode</label>
                                <select
                                    name="workMode"
                                    value={formData.workMode}
                                    onChange={handleInputChange}
                                    className="form-input"
                                >
                                    <option>Remote</option>
                                    <option>Onsite</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div className="form-group full-width">
                                <label className="form-label">Location <span className="text-danger">*</span></label>
                                <div className="input-wrapper">
                                    <MapPin size={18} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g. San Francisco, CA (or Remote)"
                                        className="form-input"
                                    />
                                </div>
                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Provide city and country, or 'Remote' if applicable.</p>
                            </div>

                            {/* Salary Min */}
                            <div className="form-group">
                                <label className="form-label">Minimum Salary</label>
                                <div className="input-wrapper">
                                    <DollarSign size={18} />
                                    <input
                                        type="number"
                                        name="salaryMin"
                                        value={formData.salaryMin}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 80000"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {/* Salary Max */}
                            <div className="form-group">
                                <label className="form-label">Maximum Salary</label>
                                <div className="input-wrapper">
                                    <DollarSign size={18} />
                                    <input
                                        type="number"
                                        name="salaryMax"
                                        value={formData.salaryMax}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 120000"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="form-group">
                                <label className="form-label">Experience Required</label>
                                <select
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    className="form-input"
                                >
                                    <option>No Experience</option>
                                    <option>0-2 years</option>
                                    <option>2-5 years</option>
                                    <option>5-8 years</option>
                                    <option>8+ years</option>
                                </select>
                            </div>

                            {/* Currency */}
                            <div className="form-group">
                                <label className="form-label">Currency</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className="form-input"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                </select>
                            </div>

                            {/* Skills */}
                            <div className="form-group full-width">
                                <label className="form-label">Required Skills</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="Type skill and press Enter..."
                                        className="form-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={addSkill}
                                        className="btn-secondary"
                                        style={{ padding: '0 16px', height: 'auto' }}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                    {formData.skills.map(skill => (
                                        <span key={skill} className="tag">
                                            {skill}
                                            <button onClick={() => removeSkill(skill)} style={{ marginLeft: '4px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {formData.skills.length === 0 && (
                                        <span style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>No skills added yet.</span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-group full-width">
                                <label className="form-label">Job Description <span className="text-danger">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={8}
                                    placeholder="Enter detailed job description, responsibilities, and benefits..."
                                    className="form-input"
                                    style={{ fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Review */}
                {currentStep === 2 && (
                    <div className="animate-fadeIn">
                        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Review & Publish</h2>
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>Double check your job posting details.</p>
                        </div>

                        <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{formData.title}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '14px', color: '#4b5563' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                        <Briefcase size={14} /> {formData.employmentType}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                        <MapPin size={14} /> {formData.location} ({formData.workMode})
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                        <DollarSign size={14} /> {formData.salaryMin} - {formData.salaryMax} {formData.currency}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Required Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {formData.skills.map(skill => (
                                        <span key={skill} className="tag" style={{ background: 'white' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Description</h4>
                                <div style={{ whiteSpace: 'pre-wrap', color: '#4b5563', lineHeight: '1.6', fontSize: '14px' }}>
                                    {formData.description}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                    {currentStep > 1 ? (
                        <button
                            onClick={handleBack}
                            className="btn-secondary"
                        >
                            Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {currentStep < 2 ? (
                        <button
                            onClick={handleNext}
                            disabled={!isStep1Valid}
                            className={`btn-primary ${!isStep1Valid ? 'opacity-50' : ''}`}
                            style={!isStep1Valid ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="btn-primary"
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish Job'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
