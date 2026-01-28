'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopNavProps {
  showNav?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ showNav = true }) => {
  const pathname = usePathname();

  // 인터레스트 이후 페이지인지 확인
  const isAfterInterests = [
    '/submit-video',
    '/video-options',
    '/dashboard',
    '/pricing',
  ].includes(pathname);

  if (!showNav || !isAfterInterests) return null;

  const navItems = [
    { label: 'My Recipes', href: '/dashboard?tab=recipes', icon: '📋' },
    { label: 'Project', href: '/dashboard?tab=projects', icon: '📁' },
    { label: 'Template', href: '/dashboard?tab=templates', icon: '🎨' },
    { label: 'AI Assistant', href: '/dashboard?tab=ai-assistant', icon: '🤖' },
    { label: 'Settings', href: '/dashboard?tab=settings', icon: '⚙️' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-full px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/parrot-logo.svg" alt="Parrot Kit" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">Parrot Kit</span>
          </Link>

          <div className="flex items-center gap-1 md:gap-4 overflow-x-auto">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                <span className="hidden sm:inline">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <Link
            href="/pricing"
            className="ml-4 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            Pricing
          </Link>
        </div>
      </div>
    </nav>
  );
};
