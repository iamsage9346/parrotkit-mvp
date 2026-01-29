'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Creating a video recipe just for you...'
}) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8">
        {/* Loading Spinner with bouncing logo inside */}
        <div className="relative w-40 h-40 mx-auto">
          <div className="absolute inset-0 border-8 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-t-transparent animate-spin" />
          {/* Inner circle with bouncing logo */}
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <img src="/parrot-logo.png" alt="Parrot Kit" className="w-16 h-16 animate-bounce" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mt-8 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {message}
      </h2>
      <p className="text-gray-600 text-center max-w-md">
        Analyzing video structure and detecting key moments
      </p>
    </div>
  );
};
