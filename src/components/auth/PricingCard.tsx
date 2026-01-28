'use client';

import React from 'react';
import { PricingPlan } from '@/types/auth';
import { Button } from '@/components/common';

interface PricingCardProps {
  plan: PricingPlan;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const isFree = plan.price === 0;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
        <div className="mb-2">
          <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-600 ml-1">{plan.period}</span>
        </div>
        {isFree && (
          <p className="text-sm text-gray-500">no credit card required</p>
        )}
        {!isFree && plan.price === 24 && (
          <p className="text-sm text-gray-500">Billed yearly ($288/year)</p>
        )}
      </div>

      {/* Description */}
      <p className="text-center text-gray-700 text-sm mb-6">
        {plan.description}
      </p>

      {/* Features */}
      <div className="mb-6 flex-grow">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => {
            const isEnabled = !feature.startsWith('❌') && !feature.startsWith('⭕');
            const icon = feature.startsWith('✅') ? '✅' : 
                        feature.startsWith('📷') ? '📷' : 
                        feature.startsWith('💾') ? '💾' : 
                        feature.startsWith('📄') ? '📄' : 
                        feature.startsWith('🚀') ? '🚀' :
                        feature.startsWith('❌') ? '❌' : 
                        feature.startsWith('⭕') ? '⭕' : '✅';
            
            // Remove emoji from text
            let text = feature.replace(/^[✅📷💾📄🚀❌⭕]\s*/, '');
            
            return (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-lg flex-shrink-0">{icon}</span>
                <span className={isEnabled ? 'text-gray-700' : 'text-gray-400'}>
                  {text}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA Button */}
      <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors">
        {plan.buttonText}
      </button>
    </div>
  );
};
