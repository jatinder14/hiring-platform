'use client';

import { useState } from 'react';
import {
    User,
    Building2,
    Bell,
    Shield,
    CreditCard,
    Link as LinkIcon,
    ChevronRight,
    Save,
    Upload
} from 'lucide-react';

const NOTIFICATION_KEYS = ['newApplications', 'interviewUpdates', 'platformNews'] as const;

export default function CompanySettingsPage() {
    const [notifications, setNotifications] = useState<Record<string, boolean>>({
        newApplications: true,
        interviewUpdates: true,
        platformNews: true,
    });
    return (
        <div className="dashboard-page-content">
            {/* Header */}
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your company profile and account preferences.</p>
                </div>
            </header>

            <div className="dashboard-content-grid">
                {/* Settings Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Company Profile Section */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>Company Profile</h3>
                        </div>
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '20px',
                                    backgroundColor: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed #e2e8f0',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}>
                                    <Upload size={32} style={{ color: '#9ca3af' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Company Logo</h4>
                                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>JPG, PNG or SVG. Max size of 800K</p>
                                    <button type="button" className="btn-secondary" style={{ padding: '8px 16px', height: 'auto', fontSize: '13px' }}>Change Logo</button>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <input type="text" className="form-input" defaultValue="HireU Corp" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Website URL</label>
                                    <input type="text" className="form-input" defaultValue="https://hireu.ai" />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Company Bio</label>
                                    <textarea className="form-input" rows={4} defaultValue="Revolutionizing AI-powered hiring for global teams." />
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-primary" style={{ display: 'flex', gap: '8px' }}>
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings Section */}
                    <div className="card" style={{ padding: '0' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>Email Notifications</h3>
                        </div>
                        <div style={{ padding: '24px' }}>
                            {[
                                { key: 'newApplications', title: 'New Applications', desc: 'Get notified when someone applies for a job' },
                                { key: 'interviewUpdates', title: 'Interview Updates', desc: 'Receive updates about scheduled interviews' },
                                { key: 'platformNews', title: 'Platform News', desc: 'Stay updated with HireU features and announcements' }
                            ].map((item, i) => {
                                const on = notifications[item.key] ?? true;
                                return (
                                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i === 2 ? 'none' : '1px solid #f9fafb' }}>
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>{item.title}</h4>
                                            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{item.desc}</p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={on}
                                            aria-label={`Toggle ${item.title}`}
                                            onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                                            style={{
                                                width: '44px',
                                                height: '24px',
                                                backgroundColor: on ? '#3b82f6' : '#d1d5db',
                                                borderRadius: '99px',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                border: 'none',
                                                padding: 0,
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    left: on ? 'calc(100% - 20px)' : '4px',
                                                    top: '4px',
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '50%',
                                                    transition: 'left 0.2s'
                                                }}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <div className="dashboard-sidebar-col">
                    <div className="card" style={{ padding: '12px' }}>
                        {[
                            { icon: User, label: 'Profile' },
                            { icon: Building2, label: 'Company' },
                            { icon: Bell, label: 'Notifications' },
                            { icon: Shield, label: 'Security' },
                            { icon: CreditCard, label: 'Billing' },
                            { icon: LinkIcon, label: 'Integrations' }
                        ].map((item, i) => (
                            <button
                                type="button"
                                key={i}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: i === 1 ? '#eff6ff' : 'transparent',
                                    color: i === 1 ? '#3b82f6' : '#4b5563',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <item.icon size={18} />
                                {item.label}
                                {i === 1 && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
