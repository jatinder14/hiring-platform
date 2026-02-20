'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import {
    UploadCloud, Camera, User, Phone, MapPin,
    Linkedin, Github, Twitter, Trash2, Eye, FileText, Image as ImageIcon,
    ChevronDown, Search
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const LocationSelector = dynamic(() => import('@/components/dashboard/LocationSelector'), {
    loading: () => (
        <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-slate-100/50 animate-pulse rounded-xl border border-slate-200/50"></div>
                ))}
            </div>
        </div>
    ),
    ssr: false
});


interface ResumeFile {
    id: string;
    name: string;
    type: string;
    url: string;          // blob: URL (local) or remote URL
    size: string;
    rawFile?: File;       // keep reference to original File for reliable preview
}

const COUNTRIES = [
    // North America
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Mexico', code: '+52', flag: '🇲🇽' },

    // South America
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    { name: 'Chile', code: '+56', flag: '🇨🇱' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    { name: 'Peru', code: '+51', flag: '🇵🇪' },

    // Europe
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'Italy', code: '+39', flag: '🇮🇹' },
    { name: 'Spain', code: '+34', flag: '🇪🇸' },
    { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
    { name: 'Belgium', code: '+32', flag: '🇧🇪' },
    { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
    { name: 'Austria', code: '+43', flag: '🇦🇹' },
    { name: 'Sweden', code: '+46', flag: '🇸🇪' },
    { name: 'Norway', code: '+47', flag: '🇳🇴' },
    { name: 'Denmark', code: '+45', flag: '🇩🇰' },
    { name: 'Finland', code: '+358', flag: '🇫🇮' },
    { name: 'Poland', code: '+48', flag: '🇵🇱' },
    { name: 'Czech Republic', code: '+420', flag: '🇨🇿' },
    { name: 'Hungary', code: '+36', flag: '🇭🇺' },
    { name: 'Romania', code: '+40', flag: '🇷🇴' },
    { name: 'Russia', code: '+7', flag: '🇷🇺' },
    { name: 'Turkey', code: '+90', flag: '🇹🇷' },
    { name: 'Greece', code: '+30', flag: '🇬🇷' },
    { name: 'Portugal', code: '+351', flag: '🇵🇹' },
    { name: 'Ireland', code: '+353', flag: '🇮🇪' },

    // Asia
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'China', code: '+86', flag: '🇨🇳' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'South Korea', code: '+82', flag: '🇰🇷' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬' },
    { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
    { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
    { name: 'Thailand', code: '+66', flag: '🇹🇭' },
    { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
    { name: 'Philippines', code: '+63', flag: '🇵🇭' },
    { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
    { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
    { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
    { name: 'Hong Kong', code: '+852', flag: '🇭🇰' },
    { name: 'Taiwan', code: '+886', flag: '🇹🇼' },

    // Middle East
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
    { name: 'Qatar', code: '+974', flag: '🇶🇦' },
    { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
    { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
    { name: 'Oman', code: '+968', flag: '🇴🇲' },
    { name: 'Israel', code: '+972', flag: '🇮🇱' },
    { name: 'Jordan', code: '+962', flag: '🇯🇴' },
    { name: 'Lebanon', code: '+961', flag: '🇱🇧' },

    // Africa
    { name: 'South Africa', code: '+27', flag: '🇿🇦' },
    { name: 'Egypt', code: '+20', flag: '🇪🇬' },
    { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
    { name: 'Kenya', code: '+254', flag: '🇰🇪' },
    { name: 'Morocco', code: '+212', flag: '🇲🇦' },

    // Oceania
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
].sort((a, b) => a.name.localeCompare(b.name));

import { CURRENCIES } from '@/lib/constants/currencies';

export default function ProfilePage() {
    const { data: session, status } = useSession();

    // Form States
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('+1'); // Store only phone code

    // Location States - using ISO codes for proper linking
    const [selectedCountryIso, setSelectedCountryIso] = useState('');
    const [selectedStateIso, setSelectedStateIso] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');
    const [pincode, setPincode] = useState('');


    const [linkedin, setLinkedin] = useState('');
    const [github, setGithub] = useState('');
    const [twitter, setTwitter] = useState('');
    const [noticePeriod, setNoticePeriod] = useState('Immediate');

    // CTC States - Single shared currency (both fields must use same currency)
    const [salaryCurrencyCode, setSalaryCurrencyCode] = useState('USD');
    const [currentCTC, setCurrentCTC] = useState('');
    const [expectedCTC, setExpectedCTC] = useState('');

    // Derive shared currency object
    const salaryCurrency = CURRENCIES.find(c => c.code === salaryCurrencyCode) || CURRENCIES[0];

    // Derive country object from selected code
    const countryCode = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

    // Media States
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [resumes, setResumes] = useState<ResumeFile[]>([]);

    // UI States
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Resume preview state
    const [previewFile, setPreviewFile] = useState<ResumeFile | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const countryDropdownRef = useRef<HTMLDivElement>(null);

    // Initialize data from API
    useEffect(() => {
        const fetchProfile = async () => {
            if (status === "authenticated") {
                try {
                    const res = await fetch('/api/profile');
                    if (res.ok) {
                        const data = await res.json();
                        setFullName(data.name || '');
                        setPhoneNumber(data.phoneNumber || '');
                        setSelectedCountryCode(data.country || '+1'); // Assuming country stores phone code or update logic
                        // Location data might need better mapping if storing ISO codes
                        setSelectedCountryIso(data.country || '');
                        setSelectedStateIso(data.state || '');
                        setSelectedCityName(data.city || '');

                        setLinkedin(data.linkedin || '');
                        setGithub(data.github || '');
                        setTwitter(data.twitter || '');

                        setCurrentCTC(data.currentCTC || '');
                        setExpectedCTC(data.expectedCTC || '');
                        // Restore shared currency (use currentCurrency as source of truth)
                        if (data.currentCurrency) setSalaryCurrencyCode(data.currentCurrency);
                        else if (data.expectedCurrency) setSalaryCurrencyCode(data.expectedCurrency);
                        setNoticePeriod(data.noticePeriod || 'Immediate');
                        setProfileImage(data.profileImageUrl || session?.user?.image || null);
                    }
                } catch (error) {
                    console.error("Failed to load profile", error);
                }
            }
        };
        fetchProfile();
    }, [status, session]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setShowCountryDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close preview modal on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePreview(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newResumes: ResumeFile[] = Array.from(files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                url: URL.createObjectURL(file),
                rawFile: file,   // ← store raw File for reliable preview
            }));
            setResumes(prev => [...prev, ...newResumes]);
        }
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    /**
     * Smart preview handler:
     * - PDF (blob or remote) → in-app iframe modal
     * - Image → new tab (blob URL works fine)
     * - DOC/DOCX (remote URL) → Google Docs Viewer iframe
     * - DOC/DOCX (local blob) → trigger download (Google Docs can't read blob:)
     */
    const handlePreview = (file: ResumeFile) => {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isDoc = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')
            || file.type.includes('word') || file.type.includes('officedocument');
        const isBlob = file.url.startsWith('blob:');

        if (isImage) {
            window.open(file.url, '_blank');
            return;
        }

        if (isPdf) {
            // PDF: show in iframe modal (blob URLs work fine in iframe)
            setPreviewFile(file);
            setPreviewLoading(true);
            return;
        }

        if (isDoc) {
            if (isBlob) {
                // Local blob: Google Docs Viewer can't read blob: — trigger download instead
                const a = document.createElement('a');
                a.href = file.url;
                a.download = file.name;
                a.click();
                toast('DOC/DOCX downloaded — open with Word or Docs to preview.');
            } else {
                // Remote URL: send through Google Docs Viewer
                const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;
                setPreviewFile({ ...file, url: viewerUrl });
                setPreviewLoading(true);
            }
            return;
        }

        // Fallback: try new tab
        if (file.url) {
            window.open(file.url, '_blank');
        } else {
            toast.error('Resume not available. Please re-upload.');
        }
    };

    const closePreview = () => setPreviewFile(null);

    const deleteResume = (id: string) => {
        setResumes(prev => prev.filter(r => r.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    phoneNumber,
                    country: selectedCountryIso,
                    state: selectedStateIso,
                    city: selectedCityName,
                    linkedin,
                    github,
                    twitter,
                    currentCTC,
                    currentCurrency: salaryCurrencyCode,
                    expectedCTC,
                    expectedCurrency: salaryCurrencyCode,  // always same as current
                    noticePeriod,
                    profileImageUrl: profileImage
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            alert('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading") return <div className="p-8 text-center text-muted">Loading profile...</div>;

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1 className="page-title">Edit Profile</h1>
                <p className="page-subtitle">Manage your personal and professional information.</p>
            </div>

            <div className="profile-section card">
                {/* Profile Picture Section */}
                <div className="profile-header">
                    <div className="profile-avatar" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ color: '#d1d5db' }}>
                                <User size={48} />
                            </div>
                        )}
                        <div className="upload-overlay">
                            <Camera size={16} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                        />
                    </div>
                    <div>
                        <h2 className="font-bold mb-1" style={{ fontSize: '20px' }}>
                            {fullName || 'Your Name'}
                        </h2>
                        <p className="text-muted">User Profile</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="section-title">Personal Information</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input
                                    type="text"
                                    className="form-input"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <div className="phone-input-group">
                                <div style={{ position: 'relative' }} ref={countryDropdownRef}>
                                    <button
                                        type="button"
                                        className="form-input country-code-btn"
                                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                    >
                                        <span>{countryCode.flag} {countryCode.code}</span>
                                        <ChevronDown size={14} className="text-muted" />
                                    </button>

                                    {showCountryDropdown && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            width: '240px',
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '10px',
                                            marginTop: '4px',
                                            zIndex: 100,
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}>
                                            {COUNTRIES.map((country) => (
                                                <div
                                                    key={country.name}
                                                    style={{
                                                        padding: '10px 16px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        transition: 'background 0.2s',
                                                        fontSize: '14px'
                                                    }}
                                                    onClick={() => {
                                                        setSelectedCountryCode(country.code);
                                                        setShowCountryDropdown(false);
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                >
                                                    <span>{country.flag}</span>
                                                    <span>{country.name}</span>
                                                    <span style={{ marginLeft: 'auto', color: '#6b7280' }}>{country.code}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="input-wrapper" style={{ flex: 1 }}>
                                    <Phone size={18} />
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        <LocationSelector
                            selectedCountryIso={selectedCountryIso}
                            setSelectedCountryIso={setSelectedCountryIso}
                            selectedStateIso={selectedStateIso}
                            setSelectedStateIso={setSelectedStateIso}
                            selectedCityName={selectedCityName}
                            setSelectedCityName={setSelectedCityName}
                            pincode={pincode}
                            setPincode={setPincode}
                        />
                    </div>

                    {/* Social Links */}
                    <div className="section-title mt-8">Social Links</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">LinkedIn (Optional)</label>
                            <div className="input-wrapper">
                                <Linkedin size={18} />
                                <input
                                    type="url"
                                    className="form-input"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">GitHub (Optional)</label>
                            <div className="input-wrapper">
                                <Github size={18} />
                                <input
                                    type="url"
                                    className="form-input"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    placeholder="https://github.com/yourusername"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Twitter/X (Optional)</label>
                            <div className="input-wrapper">
                                <Twitter size={18} />
                                <input
                                    type="url"
                                    className="form-input"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    placeholder="https://twitter.com/yourusername"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="section-title mt-8">Professional Information</div>
                    <div className="form-grid">
                        {/* Shared Currency Selector */}
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Salary Currency</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <select
                                    className="form-input currency-select"
                                    style={{ maxWidth: '200px' }}
                                    value={salaryCurrencyCode}
                                    onChange={(e) => setSalaryCurrencyCode(e.target.value)}
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} ({c.symbol})
                                        </option>
                                    ))}
                                </select>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                    Applied to both Current &amp; Expected CTC
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Current CTC (Annual) - Optional</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Enter amount"
                                value={currentCTC}
                                onChange={(e) => setCurrentCTC(e.target.value)}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Expected CTC - Optional</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Enter amount"
                                value={expectedCTC}
                                onChange={(e) => setExpectedCTC(e.target.value)}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notice Period</label>
                            <select
                                className="form-input"
                                value={noticePeriod}
                                onChange={(e) => setNoticePeriod(e.target.value)}
                            >
                                <option>Immediate</option>
                                <option>15 Days</option>
                                <option>30 Days</option>
                                <option>60 Days</option>
                                <option>90 Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Resume Upload Section */}
                    <div className="section-title mt-8">Resume / CV</div>

                    {/* Resume List */}
                    {resumes.length > 0 && (
                        <div className="resume-list">
                            {resumes.map((file) => (
                                <div key={file.id} className="resume-item">
                                    <div className="file-info">
                                        {file.type.includes('image') ? (
                                            <ImageIcon size={24} className="text-primary" />
                                        ) : (
                                            <FileText size={24} className="text-danger" />
                                        )}
                                        <div className="file-details">
                                            <h4>{file.name}</h4>
                                            <p>{file.size}</p>
                                        </div>
                                    </div>
                                    <div className="resume-actions">
                                        <button
                                            type="button"
                                            className="action-btn view"
                                            title="Preview Resume"
                                            onClick={() => handlePreview(file)}
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            className="action-btn delete"
                                            title="Delete Resume"
                                            onClick={() => deleteResume(file.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="resume-upload-area" onClick={() => resumeInputRef.current?.click()}>
                        <UploadCloud size={48} className="text-muted" style={{ margin: '0 auto 16px' }} />
                        <h3 className="font-bold" style={{ fontSize: '16px', color: '#374151', marginBottom: '8px' }}>Click to upload or drag and drop</h3>
                        <p className="text-muted" style={{ fontSize: '14px' }}>PDF, DOCX, JPG or PNG (MAX. 5MB). Multiple allowed.</p>
                        <input
                            type="file"
                            ref={resumeInputRef}
                            hidden
                            multiple
                            accept=".pdf,.doc,.docx,image/*"
                            onChange={handleResumeUpload}
                        />
                    </div>

                    <div className="form-actions mt-8 flex justify-between gap-4">
                        <button type="button" className="btn-secondary" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Resume Preview Modal ── */}
            {previewFile && (
                <>
                    {/* Backdrop — also acts as the centring flex container */}
                    <div
                        onClick={closePreview}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 'clamp(0px, 2vw, 24px)',
                            animation: 'fadeIn 0.18s ease',
                        }}
                    >
                        {/* Modal card */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '900px',
                                height: '100%',
                                maxHeight: '92vh',
                                background: '#1a1a2e',
                                borderRadius: 'clamp(0px, 2vw, 16px)',
                                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                                display: 'flex', flexDirection: 'column',
                                overflow: 'hidden',
                                animation: 'scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                            }}
                        >
                            {/* ── Header ── */}
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
                                padding: '12px 16px',
                                background: '#0f0f1a',
                                borderBottom: '1px solid rgba(255,255,255,0.07)',
                                flexShrink: 0,
                                minHeight: '52px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                                    <FileText size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
                                    <span style={{
                                        fontSize: '13px', fontWeight: '600', color: '#e2e8f0',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        maxWidth: '55vw',
                                    }}>
                                        {previewFile.name}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                    <a
                                        href={previewFile.rawFile
                                            ? URL.createObjectURL(previewFile.rawFile)
                                            : previewFile.url}
                                        download={previewFile.name}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            padding: '5px 12px', borderRadius: '7px',
                                            background: 'rgba(255,255,255,0.07)', color: '#94a3b8',
                                            fontSize: '12px', fontWeight: '600', textDecoration: 'none',
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        ↓ Download
                                    </a>
                                    <button
                                        onClick={closePreview}
                                        style={{
                                            padding: '5px 12px', border: '1px solid rgba(239,68,68,0.25)',
                                            borderRadius: '7px',
                                            background: 'rgba(239,68,68,0.12)', color: '#f87171',
                                            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        ✕ Close
                                    </button>
                                </div>
                            </div>

                            {/* ── Content / iframe ── */}
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#111122' }}>
                                {previewLoading && (
                                    <div style={{
                                        position: 'absolute', inset: 0, zIndex: 2,
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        background: '#1a1a2e', gap: '14px',
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px',
                                            border: '3px solid rgba(96,165,250,0.15)',
                                            borderTop: '3px solid #60a5fa',
                                            borderRadius: '50%',
                                            animation: 'spin 0.75s linear infinite',
                                        }} />
                                        <span style={{ fontSize: '13px', color: '#475569' }}>
                                            Loading preview…
                                        </span>
                                    </div>
                                )}
                                <iframe
                                    key={previewFile.url}
                                    src={previewFile.url}
                                    title={previewFile.name}
                                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                    onLoad={() => setPreviewLoading(false)}
                                    onError={() => {
                                        setPreviewLoading(false);
                                        toast.error('Resume not available. Please re-upload.');
                                        closePreview();
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes fadeIn  { from { opacity: 0 }                         to { opacity: 1 } }
                        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
                        @keyframes spin    { to   { transform: rotate(360deg) } }
                        @media (max-width: 480px) {
                            .resume-modal-card {
                                border-radius: 0 !important;
                                max-height: 100dvh !important;
                                max-width: 100% !important;
                            }
                        }
                    `}</style>
                </>
            )}
        </div>
    );
}
