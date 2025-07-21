import React from 'react';
import HelpCenterHeader from './help/HelpCenterHeader';
import GameIntroduction from './help/GameIntroduction';
import HowToPlay from './help/HowToPlay';
import DifficultyLevels from './help/DifficultyLevels';
import ScoringSystem from './help/ScoringSystem';
import TimeManagement from './help/TimeManagement';
import WinningStrategies from './help/WinningStrategies';
import FAQ from './help/FAQ';

interface HelpCenterProps {
  className?: string;
  onClose?: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ className, onClose }) => {
  return (
    <main
      id='help-center'
      className={`min-h-screen ${className || ''}`}
      role='main'
      aria-labelledby='help-center-title'
    >
      <HelpCenterHeader onClose={onClose} />
      <GameIntroduction />
      <HowToPlay />
      <DifficultyLevels />
      <ScoringSystem />
      <TimeManagement />
      <WinningStrategies />
      <FAQ />
    </main>
  );
};

export default HelpCenter;
export { HelpCenter };