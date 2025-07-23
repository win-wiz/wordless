'use client';

import React from 'react';
import { FeatureItem } from '../data';

interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
            {feature.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{feature.title}</h3>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {feature.category}
            </span>
          </div>
        </div>
        
        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
          {feature.description}
        </p>
        
        <div className="space-y-2 mt-auto">
          {feature.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(FeatureCard);