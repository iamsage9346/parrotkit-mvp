import React from 'react';
import { Card } from '@/components/common';
import { PricingCard } from '@/components/auth';
import { TopNav } from '@/components/common';
import { PRICING_PLANS } from '@/types/auth';

export default function PricingPage() {
  return (
    <>
      <TopNav showNav={true} />
      <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Parrot Kit Pricing</h1>
            <p className="text-lg text-gray-600 mb-8">
              Choose the perfect plan to create viral content
            </p>

            {/* Features Comparison */}
            <Card className="mb-12 max-w-4xl mx-auto text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Free Plan</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Basic templates</li>
                    <li>✓ Limited AI assistance</li>
                    <li>✓ Community access</li>
                    <li>✗ Advanced analytics</li>
                    <li>✗ Priority support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Pro Plan</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ All Free features</li>
                    <li>✓ Unlimited AI assistance</li>
                    <li>✓ Advanced templates</li>
                    <li>✓ Advanced analytics</li>
                    <li>✓ Priority support</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PRICING_PLANS.map(plan => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">FAQ</h2>
            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can cancel your Pro subscription anytime. No long-term commitment required.
                </p>
              </Card>
              <Card>
                <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade?</h3>
                <p className="text-gray-600 text-sm">
                  Of course! You can upgrade to Pro or downgrade to Free at any time. Changes take effect immediately.
                </p>
              </Card>
              <Card>
                <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600 text-sm">
                  We offer a 14-day money-back guarantee if you're not satisfied with Pro Plan.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}