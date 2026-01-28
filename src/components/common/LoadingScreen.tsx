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
        {/* Parrot Kit Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-2xl animate-pulse" />
        </div>
        
        {/* Loading Spinner */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 border-8 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-t-transparent animate-spin" />
          {/* Inner circle */}
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <div className="text-4xl">🎬</div>
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
