'use client';

import React from 'react';
import JobSeekerForm from './JobSeekerForm';
import { AuroraCanvas } from '@/components/AuroraCanvas';

const JobSeekerRegistrationPage = () => {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <AuroraCanvas />
      <div className="relative z-10">
        <JobSeekerForm />
      </div>
    </div>
  );
};

export default JobSeekerRegistrationPage;
