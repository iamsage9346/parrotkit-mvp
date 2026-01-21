'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/common';

export const OnboardingForm: React.FC = () => {
  return (
    <Card className="text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Let's get started !</h1>
        <div className="inline-block w-32 h-32 bg-gradient-to-br from-blue-400 via-yellow-300 to-red-500 rounded-full flex items-center justify-center">
          <span className="text-6xl">🦜</span>
        </div>
      </div>

      <div className="mt-12">
        <p className="text-gray-600 text-sm mb-8">
          ParrotKit에서 바이럴 콘텐츠를 만들기 위한 여정을 시작하세요!
        </p>
        
        <Link href="/interests" className="block">
          <Button variant="primary">
            Continue →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
