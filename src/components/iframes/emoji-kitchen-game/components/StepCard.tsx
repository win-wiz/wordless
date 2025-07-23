'use client';

import React from 'react';
import { StepItem, STEP_COLORS, STEP_BG_COLORS, STEP_SHADOW_COLORS } from '../data';

interface StepCardProps {
  step: StepItem;
  index: number;
}

const StepCard: React.FC<StepCardProps> = ({ step, index }) => {
  // 获取当前步骤的颜色配置，确保不会为undefined
  const colorIndex = index % STEP_COLORS.length;
  const currentColor = STEP_COLORS[colorIndex] || 'from-green-500 to-emerald-500';
  const currentBgColor = STEP_BG_COLORS[colorIndex] || 'from-green-50 to-emerald-50';
  const currentShadowColor = STEP_SHADOW_COLORS[colorIndex] || 'shadow-green-200/50';
  
  // 根据颜色名称确定边框颜色
  const getBorderColor = () => {
    if (currentColor.includes('green')) return 'border-green-400';
    if (currentColor.includes('blue')) return 'border-blue-400';
    if (currentColor.includes('purple')) return 'border-purple-400';
    return 'border-pink-400';
  };
  
  return (
    <div className='relative group flex flex-col items-center h-full'>
      {/* Step Number Circle */}
      <div className={`relative z-10 mb-4 w-14 h-14 bg-white rounded-full border-4 ${getBorderColor()} shadow-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300`}>
        <div className={`w-8 h-8 bg-gradient-to-br ${currentColor} rounded-full flex items-center justify-center text-white font-bold text-base shadow-md`}>
          {index + 1}
        </div>
      </div>
      
      {/* Step Card */}
      <div className={`w-full bg-white rounded-2xl p-5 shadow-lg ${currentShadowColor} border border-slate-100 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl group-hover:-translate-y-2 relative overflow-hidden flex-1 min-h-[320px]`}>
        {/* Background Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentBgColor} opacity-25 rounded-2xl`}></div>
        
        {/* Content */}
        <div className='relative z-10 h-full flex flex-col'>
          {/* Step Title */}
          <div className="flex items-center justify-center mb-3">
            <h3 className='text-lg font-bold text-slate-800 text-center group-hover:text-slate-900 transition-colors duration-300 leading-tight'>
              {step.title}
            </h3>
          </div>
          
          {/* Step Description */}
          <p className='text-slate-600 leading-relaxed text-center text-sm mb-4 flex-shrink-0'>
            {step.description}
          </p>
          
          {/* Example */}
          {step.example && (
            <div className='bg-slate-50 rounded-lg p-3 text-center mb-4 flex-shrink-0'>
              <span className='text-xs text-slate-500 font-medium'>Example: </span>
              <span className='text-sm text-slate-700'>{step.example}</span>
            </div>
          )}
          
          {/* Tips */}
          <div className='flex-1 flex flex-col'>
            <h4 className='text-xs font-semibold text-slate-500 text-center mb-3'>💡 Tips</h4>
            <div className='space-y-2 flex-1'>
              {step.tips.map((tip, idx) => (
                <div key={idx} className='flex items-start gap-3 text-xs text-slate-600'>
                  <span className='w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0'></span>
                  <span className='leading-relaxed text-left flex-1'>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative Bottom Border */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${currentColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-b-2xl`}></div>
      </div>
    </div>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(StepCard);