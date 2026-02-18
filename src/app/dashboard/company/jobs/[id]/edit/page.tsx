'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    ArrowLeft,
    Save,
    Loader2,
    X,
    Plus,
    Building2,
    Globe
} from 'lucide-react';

export default function EditJobPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<any>({
        title: '',
        company: '',
        location: '',
        description: '',
        employmentType: 'Full-time',
        category: '',
        skills: [],
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        status: 'DRAFT'
    });

    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const id = Array.isArray(params.id) ? params.id[0] : params.id;
                const res = await fetch(`/api/company/jobs/${id}`);

                if (!res.ok) throw new Error('Failed to fetch job');

                const data = await res.json();

                // Parse Salary string if possible
                let min = '';
                let max = '';
                if (data.salary) {
                    const parts = data.salary.split(' - ');
                    if (parts.length === 2) {
                        min = parts[0];
                        max = parts[1];
                    } else {
                        min = data.salary;
                    }
                }

                setFormData({
                    ...data,
                    salaryMin: min,
                    salaryMax: max,
                    skills: data.skills || []
                });
            } catch (error) {
                console.error(error);
                toast.error('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [params.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData((prev: any) => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData((prev: any) => ({
            ...prev,
            skills: prev.skills.filter((skill: string) => skill !== skillToRemove)
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Combine salary
            let finalSalary = formData.salaryMin;
            if (formData.salaryMax) {
                finalSalary = `${formData.salaryMin} - ${formData.salaryMax}`;
            }

            const payload = {
                ...formData,
                salary: finalSalary
            };
            // Remove temp fields
            delete payload.salaryMin;
            delete payload.salaryMax;

            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            const res = await fetch(`/api/company/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update job');

            router.push('/dashboard/company/jobs');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const getStatusStyle = (status: string) => {
        const baseStyle = {
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'capitalize' as const,
            display: 'inline-block'
        };
        switch (status) {
            case 'ACTIVE': return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
            case 'DRAFT': return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
            default: return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
            <Link href="/dashboard/company/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
                <ArrowLeft size={18} /> Back to Jobs
            </Link>

            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Edit Job Posting</h1>
                    <span style={getStatusStyle(formData.status)}>{formData.status}</span>
                </div>

                <form onSubmit={handleSave} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Basic Info */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Job Title</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="form-input"
                                    style={{ width: '100%', paddingLeft: '40px' }}
                                    placeholder="e.g. Senior Product Designer"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Location</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="form-input"
                                    style={{ width: '100%', paddingLeft: '40px' }}
                                    placeholder="e.g. Remote, New York"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Employment Type</label>
                            <div style={{ position: 'relative' }}>
                                <Clock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                                <select
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                    className="form-input"
                                    style={{ width: '100%', paddingLeft: '40px', appearance: 'none', backgroundColor: 'white' }}
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Category</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="form-input"
                                    style={{ width: '100%', paddingLeft: '40px' }}
                                    placeholder="e.g. Engineering"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Salary Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1 1 150px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Salary Range</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    className="form-input"
                                    style={{ width: '100%', paddingLeft: '40px' }}
                                    placeholder="Min"
                                />
                            </div>
                        </div>
                        <div style={{ flex: '1 1 150px' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    className="form-input"
                                    style={{ width: '100%', paddingLeft: '16px' }}
                                    placeholder="Max (Optional)"
                                />
                            </div>
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                            <div style={{ position: 'relative' }}>
                                <Globe size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="form-input"
                                    style={{ width: '100%', paddingLeft: '40px', appearance: 'none', backgroundColor: 'white' }}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="form-input"
                            style={{ width: '100%', appearance: 'none', backgroundColor: 'white' }}
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="CLOSED">Closed (Hidden)</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={8}
                            className="form-input"
                            style={{ width: '100%', minHeight: '150px', lineHeight: '1.6' }}
                            placeholder="Detailed job description..."
                            required
                        />
                    </div>

                    {/* Skills */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Skills</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                            {formData.skills && formData.skills.map((skill: string) => (
                                <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px', fontSize: '14px', fontWeight: '500', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#2563eb', display: 'flex' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className="form-input"
                                style={{ flex: 1 }}
                                placeholder="Add skill and press Enter"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                style={{ padding: '0 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', color: '#374151', cursor: 'pointer' }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                        <Link
                            href="/dashboard/company/jobs"
                            style={{ padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', color: '#4b5563' }}
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
