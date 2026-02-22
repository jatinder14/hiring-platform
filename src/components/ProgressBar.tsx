
import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[9999]">
      <div
        className="h-full bg-[#ff6b00] shadow-[0_0_20px_#ff6b00]"
        style={{ width: `${progress}%`, transition: 'width 1s cubic-bezier(0.65, 0, 0.35, 1)' }}
        role="progressbar"
        aria-label="Page load progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      ></div>
    </div>
  );
};

export default ProgressBar;
