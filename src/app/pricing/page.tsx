'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PricingCard } from '@/components/auth';
import { PRICING_PLANS } from '@/types/auth';

export default function PricingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-blue-500 text-2xl"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <img src="/parrot-logo.svg" alt="Parrot Kit" className="w-6 h-6" />
          <h1 className="text-xl font-bold text-gray-900">Parrot Kit</h1>
        </div>
        <div className="w-6" />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 transform md:transform-none transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <img src="/parrot-logo.svg" alt="Parrot Kit" className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-gray-900">Parrot Kit</h2>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard?tab=recipes"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📋</span>
              <span className="font-medium">My Recipes</span>
            </Link>
            <Link
              href="/dashboard?tab=projects"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📁</span>
              <span className="font-medium">Project</span>
            </Link>
            <Link
              href="/dashboard?tab=templates"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>🎨</span>
              <span className="font-medium">Template</span>
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium"
            >
              <span>💳</span>
              <span>Pricing</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen bg-gray-50 py-12 px-4 md:px-8 pt-24 md:pt-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Parrot Kit Pricing</h1>
            <p className="text-lg text-gray-600"> 
              Choose the perfect plan to create viral content
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PRICING_PLANS.map(plan => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">FAQ</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can cancel your Pro subscription anytime. No long-term commitment required.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade?</h3>
                <p className="text-gray-600 text-sm">
                  Of course! You can upgrade to Pro or downgrade to Free at any time.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600 text-sm">
                  We offer a 14-day money-back guarantee if you're not satisfied with Pro Plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}