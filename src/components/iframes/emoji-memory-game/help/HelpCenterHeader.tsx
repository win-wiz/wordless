import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface HelpCenterHeaderProps {
  onClose?: () => void;
}

const HelpCenterHeader: React.FC<HelpCenterHeaderProps> = React.memo(({ onClose }) => {
  return (
    <div className='py-20 px-6'>
      <div className='max-w-6xl mx-auto text-center'>
        <h1 className='text-6xl font-bold text-slate-800 mb-8'>
          🧠 Emoji Memory Game Help Center
        </h1>
        <div className='w-40 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-8'></div>
        <p className='text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed'>
          Welcome to the official Emoji Memory Game guide! Master this engaging
          memory puzzle game where you flip cards to find matching emoji pairs.
          Learn everything from basic rules to advanced memory strategies.
        </p>
        {onClose && (
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mt-6"
          >
            Back to Game
          </Button>
        )}
      </div>
    </div>
  );
});

HelpCenterHeader.displayName = 'HelpCenterHeader';

export default HelpCenterHeader;