'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRecruiterBasePath } from '@/components/RecruiterBasePathContext';
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle, ChevronRight, X, Plus, Search, Globe, Building2, Map as MapIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type JobData = {
    title: string;
    employmentType: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
    salaryMin: string;
    salaryMax: string;
    currency: string;
    workMode: 'Remote' | 'Onsite' | 'Hybrid';
    skills: string[];
    description: string;
    expMin: string;
    expMax: string;
    requirements: string;
    category: string;
};

const STEPS = [
    { number: 1, title: 'Job Details', subtitle: 'Basic information' },
    { number: 2, title: 'Review & Publish', subtitle: 'Final check' },
];

const CURRENCIES = [
    { code: 'USD', symbol: '$' },
    { code: 'INR', symbol: '₹' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'AED', symbol: 'د.إ' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'JPY', symbol: '¥' },
    { code: 'SGD', symbol: 'S$' },
];

const SKILLS_DB = [
    "Python", "JavaScript", "React", "Node.js", "Next.js", "Java", "C#", "C++", "AWS", "Docker", "Kubernetes",
    "PostgreSQL", "MongoDB", "TypeScript", "Angular", "Vue.js", "Django", "Flask", "Spring Boot", "Go", "Rust",
    "Product Management", "UI/UX Design", "Figma", "Adobe XD", "Marketing", "SEO", "Growth Hacking",
    "Project Management", "Agile", "Scrum", "Business Analysis", "Financial Modeling", "Data Analysis",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Tableau", "Power BI",
    "Problem Solving", "Teamwork", "Communication", "Leadership", "Spanish", "German", "French", "Japanese"
];

// Simple Location Data for Demo
const COUNTRIES = ["United States", "India", "United Kingdom", "Canada", "Germany", "United Arab Emirates", "Australia"];
const STATES: Record<string, string[]> = {
    "United States": ["California", "New York", "Texas", "Florida", "Washington"],
    "India": ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Telangana", "Gujarat"],
    "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
};
const CITIES: Record<string, string[]> = {
    "California": ["San Francisco", "Los Angeles", "San Diego", "San Jose"],
    "New York": ["New York City", "Buffalo", "Rochester"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli"],
};

export default function CreateJobForm() {
    const router = useRouter();
    const { data: session } = useSession();
    const base = useRecruiterBasePath();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<JobData>({
        title: '',
        employmentType: 'Full-time',
        country: '',
        state: '',
        city: '',
        pincode: '',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        workMode: 'Remote',
        skills: [],
        description: '',
        expMin: '',
        expMax: '',
        requirements: '',
        category: 'Engineering'
    });

    const [skillInput, setSkillInput] = useState('');
    const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const skillInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (skillInput.trim()) {
            const filtered = SKILLS_DB.filter(s =>
                s.toLowerCase().includes(skillInput.toLowerCase()) &&
                !formData.skills.includes(s)
            ).slice(0, 5);
            setSkillSuggestions(filtered);
            setShowSkillSuggestions(true);
        } else {
            setSkillSuggestions([]);
            setShowSkillSuggestions(false);
        }
    }, [skillInput, formData.skills]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (skillInputRef.current && !skillInputRef.current.contains(event.target as Node)) {
                setShowSkillSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Reset lower-level location fields when higher-level changes
            if (name === 'country') {
                newData.state = '';
                newData.city = '';
            } else if (name === 'state') {
                newData.city = '';
            }

            return newData;
        });
    };

    const addSkill = (skillToAdd?: string) => {
        const skill = (skillToAdd || skillInput).trim();
        if (skill && !formData.skills.includes(skill)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
            setSkillInput('');
            setShowSkillSuggestions(false);
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
            // Get company name from session or default
            const companyName = (session?.user as { name?: string })?.name || "My Company";

            // Range Validations
            if (formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
                toast.warning("Min salary cannot be greater than Max salary");
                setIsSubmitting(false);
                return;
            }
            if (formData.expMax && Number(formData.expMin) > Number(formData.expMax)) {
                toast.warning("Min experience cannot be greater than Max experience");
                setIsSubmitting(false);
                return;
            }

            // Construct payload
            const payload = {
                title: formData.title,
                company: companyName, // From user profile
                description: formData.description,
                employmentType: formData.employmentType,

                // Location Handling
                location: [formData.city, formData.state, formData.country].filter(Boolean).join(", ") || "Remote",
                country: formData.country,
                state: formData.state,
                city: formData.city,
                pincode: formData.pincode,

                // Salary Handling
                salary: formData.salaryMax
                    ? `${formData.salaryMin} - ${formData.salaryMax}`
                    : `${formData.salaryMin}`,
                currency: formData.currency,

                // Other fields
                category: formData.category,
                skills: formData.skills,
                workMode: formData.workMode,
                experienceMin: formData.expMin,
                experienceMax: formData.expMax,
                requirements: formData.requirements,

                // Critical: Set status to ACTIVE
                status: 'ACTIVE'
            };

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to post job');
            }

            // Redirect to jobs page
            router.push(`${base}/jobs`);
            router.refresh(); // Refresh data
        } catch (error: unknown) {
            console.error('[API] Error creating job:', error instanceof Error ? error.message : 'Unknown error');
            toast.error("Failed to publish job. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStep1Valid = formData.title && formData.salaryMin && formData.description && formData.expMin;

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 40px' }}>
            {/* Stepper Header */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ position: 'absolute', left: 0, top: '20px', width: '100%', height: '2px', backgroundColor: '#e5e7eb', zIndex: 0 }}></div>
                    <div
                        style={{
                            position: 'absolute', left: 0, top: '20px', height: '2px', backgroundColor: '#3b82f6', zIndex: 0, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            width: currentStep === 1 ? '0%' : '100%'
                        }}
                    ></div>

                    {STEPS.map((step) => {
                        const isActive = currentStep >= step.number;
                        const isCurrent = currentStep === step.number;

                        return (
                            <div key={step.number} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', border: '2px solid', transition: 'all 0.3s ease',
                                        backgroundColor: isActive ? '#3b82f6' : 'white',
                                        borderColor: isActive ? '#3b82f6' : '#d1d5db',
                                        color: isActive ? 'white' : '#6b7280',
                                        boxShadow: isCurrent ? '0 0 0 4px rgba(59, 130, 246, 0.15)' : 'none'
                                    }}
                                >
                                    {isActive && step.number < currentStep ? <CheckCircle size={20} /> : step.number}
                                </div>
                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: isActive ? '#111827' : '#9ca3af' }}>{step.title}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                {/* Step 1: Job Details */}
                {currentStep === 1 && (
                    <div className="animate-fadeIn">
                        <div style={{ padding: '32px', borderBottom: '1px solid #f3f4f6', background: '#fcfdfe' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>Job Information</h2>
                            <p style={{ color: '#6b7280', fontSize: '15px' }}>Fill in the details about the position.</p>
                        </div>

                        <div style={{ padding: '32px' }} className="form-grid">
                            {/* Job Title */}
                            <div className="form-group full-width">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label className="form-label" style={{ fontWeight: '700', margin: 0 }}>Job Title <span className="text-danger">*</span></label>
                                    <span style={{ fontSize: '12px', color: formData.title.length >= 50 ? '#ef4444' : '#6b7280', fontWeight: '600' }}>
                                        {formData.title.length}/50
                                    </span>
                                </div>
                                <div className="input-wrapper">
                                    <Briefcase size={18} />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Senior Frontend Engineer"
                                        className="form-input"
                                        maxLength={50}
                                    />
                                </div>
                                {formData.title.length >= 50 && (
                                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                                        Character limit reached (max 50)
                                    </p>
                                )}
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

                            {/* Category */}
                            <div className="form-group">
                                <label className="form-label">Job Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="form-input"
                                >
                                    <option>Engineering</option>
                                    <option>Marketing</option>
                                    <option>Sales</option>
                                    <option>Design</option>
                                    <option>Finance</option>
                                    <option>Human Resources</option>
                                    <option>Operations</option>
                                    <option>Product</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            {/* Location Section */}
                            <div className="form-group full-width" style={{ marginTop: '8px' }}>
                                <label className="form-label" style={{ color: '#3b82f6', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location Details (Optional)</label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px',
                                    marginTop: '12px'
                                }}>
                                    {/* Country */}
                                    <div>
                                        <label className="form-label" style={{ fontSize: '13px' }}>Country</label>
                                        <div className="input-wrapper">
                                            <Globe size={16} />
                                            <select name="country" value={formData.country} onChange={handleInputChange} className="form-input">
                                                <option value="">Select Country</option>
                                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {/* State */}
                                    <div>
                                        <label className="form-label" style={{ fontSize: '13px' }}>State</label>
                                        <div className="input-wrapper">
                                            <MapIcon size={16} />
                                            <select name="state" value={formData.state} onChange={handleInputChange} className="form-input" disabled={!formData.country}>
                                                <option value="">Select State</option>
                                                {(STATES[formData.country] || []).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {/* City */}
                                    <div>
                                        <label className="form-label" style={{ fontSize: '13px' }}>City</label>
                                        <div className="input-wrapper">
                                            <Building2 size={16} />
                                            <select name="city" value={formData.city} onChange={handleInputChange} className="form-input" disabled={!formData.state}>
                                                <option value="">Select City</option>
                                                {(CITIES[formData.state] || []).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Pincode */}
                                    <div>
                                        <label className="form-label" style={{ fontSize: '13px' }}>Pincode</label>
                                        <div className="input-wrapper">
                                            <MapPin size={16} />
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 110001"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Salary Section */}
                            <div className="form-group full-width" style={{ marginTop: '8px' }}>
                                <label className="form-label" style={{ color: '#3b82f6', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compensation</label>
                                <div className="compensation-grid">
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '13px' }}>Min Salary</label>
                                        <div className="salary-input-group">
                                            <div className="currency-symbol">
                                                {CURRENCIES.find(c => c.code === formData.currency)?.symbol}
                                            </div>
                                            <input
                                                type="number"
                                                name="salaryMin"
                                                value={formData.salaryMin}
                                                onChange={handleInputChange}
                                                placeholder="60,000"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '13px' }}>Max Salary</label>
                                        <div className="salary-input-group">
                                            <div className="currency-symbol">
                                                {CURRENCIES.find(c => c.code === formData.currency)?.symbol}
                                            </div>
                                            <input
                                                type="number"
                                                name="salaryMax"
                                                value={formData.salaryMax}
                                                onChange={handleInputChange}
                                                placeholder="90,000"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '13px' }}>Currency</label>
                                        <select
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            style={{ height: '48px' }}
                                        >
                                            {CURRENCIES.map(c => (
                                                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Experience Section */}
                            <div className="form-group full-width" style={{ marginTop: '8px' }}>
                                <label className="form-label" style={{ color: '#3b82f6', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience (in years)</label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px',
                                    marginTop: '12px'
                                }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '13px' }}>Min Experience <span className="text-danger">*</span></label>
                                        <div className="input-wrapper">
                                            <Clock size={16} />
                                            <input
                                                type="number"
                                                name="expMin"
                                                value={formData.expMin}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 2"
                                                className="form-input"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '13px' }}>Max Experience</label>
                                        <div className="input-wrapper">
                                            <Clock size={16} />
                                            <input
                                                type="number"
                                                name="expMax"
                                                value={formData.expMax}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 5"
                                                className="form-input"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Tag Section */}
                            <div className="form-group full-width" style={{ marginTop: '28px' }}>
                                <label className="form-label" style={{
                                    color: '#3b82f6',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '16px',
                                    display: 'block'
                                }}>
                                    Required Skills
                                </label>
                                <div className="skills-outer-container" ref={skillInputRef}>
                                    {formData.skills.length > 0 && (
                                        <div className="skills-chip-area">
                                            {formData.skills.map(skill => (
                                                <span key={skill} className="skill-chip">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill(skill)}>
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="skill-search-bar" style={{ borderColor: isSearchFocused ? '#3b82f6' : '#d1d5db', backgroundColor: isSearchFocused ? 'white' : '#f9fafb' }}>
                                        <Search size={18} style={{ color: isSearchFocused ? '#3b82f6' : '#9ca3af' }} />
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addSkill();
                                                }
                                            }}
                                            placeholder="Search or add a custom skill..."
                                            onFocus={() => {
                                                setIsSearchFocused(true);
                                                if (skillInput.trim()) setShowSkillSuggestions(true);
                                            }}
                                            onBlur={() => setIsSearchFocused(false)}
                                        />
                                        <button type="button" onClick={() => addSkill()} className="btn-add-skill">
                                            Add
                                        </button>
                                    </div>

                                    {showSkillSuggestions && skillSuggestions.length > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                            backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                                            marginTop: '4px', zIndex: 100, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            overflow: 'hidden'
                                        }}>
                                            {skillSuggestions.map(s => (
                                                <div
                                                    key={s}
                                                    onClick={() => addSkill(s)}
                                                    style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-group full-width" style={{ marginTop: '8px' }}>
                                <label className="form-label" style={{ fontWeight: '700', marginBottom: '10px', display: 'block' }}>Job Description <span className="text-danger">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={10}
                                    placeholder="Briefly describe the role, responsibilities, and who you're looking for..."
                                    className="form-input"
                                    style={{ fontFamily: 'inherit', lineHeight: '1.6', fontSize: '15px' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Review */}
                {currentStep === 2 && (
                    <div className="animate-fadeIn">
                        <div style={{ padding: '32px', borderBottom: '1px solid #f3f4f6', background: '#fcfdfe' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>Review & Publish</h2>
                            <p style={{ color: '#6b7280', fontSize: '15px' }}>Check if everything looks correct before going live.</p>
                        </div>

                        <div style={{ padding: '32px' }}>
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '1px solid #f3f4f6', paddingBottom: '32px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>{formData.title}</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: '#4b5563', padding: '6px 14px', borderRadius: '10px', background: '#f1f5f9' }}>
                                                <Briefcase size={16} /> {formData.employmentType}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: '#3b82f6', padding: '6px 14px', borderRadius: '10px', background: '#eff6ff' }}>
                                                <MapPin size={16} /> {formData.city ? `${formData.city}, ` : ''}{formData.state ? `${formData.state}, ` : ''}{formData.country || 'Remote'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '800', color: '#9ca3af', marginBottom: '4px' }}>Salary Range</p>
                                        <p style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                                            {CURRENCIES.find(c => c.code === formData.currency)?.symbol}{formData.salaryMin} - {CURRENCIES.find(c => c.code === formData.currency)?.symbol}{formData.salaryMax}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '16px', letterSpacing: '0.05em' }}>Required Skills</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {formData.skills.map(skill => (
                                                <span key={skill} style={{ fontSize: '13px', fontWeight: '700', color: '#111827', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    {skill}
                                                </span>
                                            ))}
                                            {formData.skills.length === 0 && <span style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>None listed</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '16px', letterSpacing: '0.05em' }}>Experience</h4>
                                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                                            {formData.expMin}{formData.expMax ? ` - ${formData.expMax}` : '+'} Years
                                        </p>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '16px', letterSpacing: '0.05em' }}>Work Mode</h4>
                                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{formData.workMode}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '16px', letterSpacing: '0.05em' }}>Detailed Description</h4>
                                    <div style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-wrap', backgroundColor: '#fcfdfe', padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        {formData.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="form-footer" style={{ position: 'relative' }}>
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="btn-back"
                            style={{
                                border: '1px solid #e5e7eb', background: 'white', color: '#4b5563',
                                padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                        >
                            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back
                        </button>
                    )}

                    {currentStep < 2 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!isStep1Valid}
                            style={{
                                border: 'none', background: !isStep1Valid ? '#94a3b8' : '#3b82f6', color: 'white',
                                padding: '12px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                                cursor: !isStep1Valid ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: !isStep1Valid ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                            onMouseEnter={e => !isStep1Valid ? null : e.currentTarget.style.background = '#2563eb'}
                            onMouseLeave={e => !isStep1Valid ? null : e.currentTarget.style.background = '#3b82f6'}
                        >
                            Review Posting <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                border: 'none', background: '#10b981', color: 'white',
                                padding: '12px 40px', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                            onMouseEnter={e => isSubmitting ? null : e.currentTarget.style.background = '#059669'}
                            onMouseLeave={e => isSubmitting ? null : e.currentTarget.style.background = '#10b981'}
                        >
                            {isSubmitting ? (
                                <>Going Live <Loader2 className="animate-spin" size={18} /></>
                            ) : (
                                <>Publish Now <CheckCircle size={18} /></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
