'use client';
import React from 'react';
import RecruiterForm from './RecruiterForm';
import { AuroraCanvas } from '@/components/AuroraCanvas';

const RecruiterRegistrationPage = () => {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <AuroraCanvas />
      <div className="relative z-10">
        <RecruiterForm />
      </div>
    </div>
  );
};

export default RecruiterRegistrationPage;
