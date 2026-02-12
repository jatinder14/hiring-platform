'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';
import './Registration.css';

interface JobSeekerFormData {
    firstName: string;
    lastName: string;
    email: string;
    currentRole: string;
    experience: string;
    skills: string;
    resume: File | null;
}

const JobSeekerForm = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const totalSteps = 4;
    const [formData, setFormData] = useState<JobSeekerFormData>({
        firstName: '',
        lastName: '',
        email: '',
        currentRole: '',
        experience: '',
        skills: '',
        resume: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
        }
    };

    const nextStep = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate MongoDB integration
        console.log('Submitting to MongoDB logic here...', formData);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const progress = (step / totalSteps) * 100;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="step-card"
                    >
                        <div className="step-header">
                            <h1>What are your contact details? *</h1>
                        </div>
                        <div className="input-group">
                            <div className="input-row">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Enter your first name"
                                    className="input-block-glass"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Enter your last name"
                                    className="input-block-glass"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your personal email"
                                className="input-block-glass"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="step-card"
                    >
                        <div className="step-header">
                            <h1>What's your professional background? *</h1>
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                name="currentRole"
                                placeholder="What is your current or desired role?"
                                className="input-block-glass"
                                value={formData.currentRole}
                                onChange={handleInputChange}
                                autoFocus
                            />
                            <input
                                type="text"
                                name="experience"
                                placeholder="Years of experience (e.g. 5+)"
                                className="input-block-glass"
                                value={formData.experience}
                                onChange={handleInputChange}
                            />
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="step-card"
                    >
                        <div className="step-header">
                            <h1>Key skills you excel at? *</h1>
                        </div>
                        <div className="input-group">
                            <textarea
                                name="skills"
                                placeholder="E.g. React, Node.js, Python, UI Design..."
                                className="input-block-glass"
                                rows={4}
                                value={formData.skills}
                                onChange={handleInputChange}
                                autoFocus
                                style={{ resize: 'none' }}
                            />
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="step-card"
                    >
                        <div className="step-header">
                            <h1>One last thing: Upload your resume *</h1>
                        </div>
                        <div className="input-group">
                            <label className="file-upload-container">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <div className="file-upload-icon">
                                    <Upload size={48} />
                                </div>
                                <h3>{formData.resume ? 'Change Resume' : 'Find your resume or drag & drop'}</h3>
                                <p className="helper-text">PDF, DOC, DOCX up to 10MB</p>
                                {formData.resume && (
                                    <div className="file-name" style={{ color: '#00ffe6' }}>
                                        <FileText size={16} style={{ marginRight: '8px', display: 'inline' }} /> {formData.resume.name}
                                    </div>
                                )}
                            </label>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    if (isSuccess) {
        return (
            <div className="registration-container">
                <div className="form-content">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="step-card"
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ color: '#4CAF50', marginBottom: '2rem' }}>
                            <CheckCircle size={80} style={{ margin: '0 auto' }} />
                        </div>
                        <h1>Perfect! You're all set.</h1>
                        <p className="helper-text" style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
                            We've received your application. Our team will get back to you soon.
                        </p>
                        <button
                            className="next-button"
                            style={{ margin: '2rem auto 0' }}
                            onClick={() => router.push('/')}
                        >
                            Back to Home
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="registration-container">
            <div className="progress-bar-container">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%`, backgroundColor: '#00ffe6' }}
                ></div>
            </div>

            {step > 1 ? (
                <button className="back-button" onClick={prevStep}>
                    <ArrowLeft size={18} /> Back
                </button>
            ) : (
                <button className="back-button" onClick={() => router.push('/')}>
                    <ArrowLeft size={18} /> Exit
                </button>
            )}

            <div className="form-content">
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>

                <div className="form-footer">
                    <div className="helper-text">
                        {step === 1 ? (
                            <>Looking for talent? <button onClick={() => router.push('/recruiter/register')} style={{ background: 'none', border: 'none', color: '#00ffe6', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Hire here</button></>
                        ) : null}
                    </div>

                    <div className="next-action">
                        <span className="press-enter">Press enter ↵ or</span>
                        <button
                            className="next-button"
                            onClick={nextStep}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : step === totalSteps ? 'Finish' : 'Next'}
                            <div className="button-icon">
                                <ChevronRight size={18} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerForm;
