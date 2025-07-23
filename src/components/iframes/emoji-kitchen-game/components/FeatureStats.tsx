'use client';

import React from 'react';

interface StatItem {
  value: string;
  label: string;
  gradient: string;
}

interface FeatureStatsProps {
  stats: StatItem[];
}

const FeatureStats: React.FC<FeatureStatsProps> = ({ stats }) => {
  return (
    <div className='mt-16 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-slate-200/50'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
        {stats.map((stat, index) => (
          <div key={index} className='group cursor-pointer'>
            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
              {stat.value}
            </div>
            <div className='text-slate-600 font-medium'>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(FeatureStats);