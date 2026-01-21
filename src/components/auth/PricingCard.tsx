'use client';

import React from 'react';
import { PricingPlan } from '@/types/auth';
import { Button } from '@/components/common';

interface PricingCardProps {
  plan: PricingPlan;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  return (
    <div
      className={`rounded-xl p-8 flex flex-col h-full transition-all duration-300 ${
        plan.popular
          ? 'bg-blue-50 border-2 border-blue-500 shadow-lg scale-105'
          : 'bg-white border border-gray-200 shadow-md'
      }`}
    >
      {plan.popular && (
        <div className="mb-4">
          <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Popular
          </span>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-600">{plan.period}</span>
        </div>
      </div>

      <div className="mb-8 flex-grow">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className={`mt-1 ${plan.popular ? 'text-blue-500' : 'text-green-500'}`}>
                ✓
              </span>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button variant={plan.popular ? 'primary' : 'secondary'}>{plan.buttonText}</Button>
    </div>
  );
};
