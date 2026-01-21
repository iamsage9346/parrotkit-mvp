'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DashboardLayout,
  MyRecipes,
  Projects,
  Templates,
  AIAssistant,
  Settings,
} from '@/components/auth';
import { DashboardTab } from '@/types/auth';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as DashboardTab | null;
  const activeTab = (tabParam || 'recipes') as DashboardTab;

  const renderContent = () => {
    switch (activeTab) {
      case 'recipes':
        return <MyRecipes />;
      case 'projects':
        return <Projects />;
      case 'templates':
        return <Templates />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'settings':
        return <Settings />;
      default:
        return <MyRecipes />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab}>
      {renderContent()}
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
