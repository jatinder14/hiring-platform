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
    url: string;
    size: string;
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

    // CTC States - Store only currency codes, derive objects when needed
    const [currentCurrencyCode, setCurrentCurrencyCode] = useState('USD');
    const [currentCTC, setCurrentCTC] = useState('');
    const [expectedCurrencyCode, setExpectedCurrencyCode] = useState('USD');
    const [expectedCTC, setExpectedCTC] = useState('');

    // Derive currency objects from codes
    const currentCurrency = CURRENCIES.find(c => c.code === currentCurrencyCode) || CURRENCIES[0];
    const expectedCurrency = CURRENCIES.find(c => c.code === expectedCurrencyCode) || CURRENCIES[0];

    // Derive country object from selected code
    const countryCode = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

    // Media States
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [resumes, setResumes] = useState<ResumeFile[]>([]);

    // UI States
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

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
                url: URL.createObjectURL(file)
            }));
            setResumes(prev => [...prev, ...newResumes]);
        }
    };

    const deleteResume = (id: string) => {
        setResumes(prev => prev.filter(r => r.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    phoneNumber,
                    country: selectedCountryIso, // Storing ISO or name? Using the state variable
                    state: selectedStateIso,
                    city: selectedCityName,
                    linkedin,
                    github,
                    twitter,
                    currentCTC,
                    expectedCTC,
                    noticePeriod,
                    profileImageUrl: profileImage
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            alert('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update profile.');
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
                        <div className="form-group">
                            <label className="form-label">Current CTC (Annual) - Optional</label>
                            <div className="currency-input-group">
                                <select
                                    className="form-input currency-select"
                                    value={currentCurrency.code}
                                    onChange={(e) => setCurrentCurrencyCode(e.target.value)}
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} ({c.symbol})
                                        </option>
                                    ))}
                                </select>
                                <div className="input-wrapper amount-input">
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '600', color: '#374151', pointerEvents: 'none' }}>
                                        {currentCurrency.symbol}
                                    </span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ paddingLeft: '32px' }}
                                        placeholder="Amount"
                                        value={currentCTC}
                                        onChange={(e) => setCurrentCTC(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Expected CTC - Optional</label>
                            <div className="currency-input-group">
                                <select
                                    className="form-input currency-select"
                                    value={expectedCurrency.code}
                                    onChange={(e) => setExpectedCurrencyCode(e.target.value)}
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} ({c.symbol})
                                        </option>
                                    ))}
                                </select>
                                <div className="input-wrapper amount-input">
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '600', color: '#374151', pointerEvents: 'none' }}>
                                        {expectedCurrency.symbol}
                                    </span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ paddingLeft: '32px' }}
                                        placeholder="Amount"
                                        value={expectedCTC}
                                        onChange={(e) => setExpectedCTC(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>
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

                        <div className="form-group">
                            <label className="form-label">LinkedIn Profile</label>
                            <div className="input-wrapper">
                                <Linkedin size={18} />
                                <input
                                    type="url"
                                    className="form-input"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
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
                                            title="View Resume"
                                            onClick={() => window.open(file.url, '_blank')}
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
                            accept=".pdf,image/*"
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
            </div >
        </div >
    );
}
