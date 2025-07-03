import React, { useMemo } from 'react';

// 优化的列表项组件
const AnalysisMethodItem = React.memo<{
  number: number;
  title: string;
  description: string;
}>(({ number, title, description }) => {
  const itemStyles = useMemo(() => ({
    numberStyle: 'w-8 h-8 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg border border-slate-200',
    titleStyle: 'text-slate-700 text-lg block mb-2',
    descriptionStyle: 'text-slate-600 leading-relaxed'
  }), []);

  return (
    <li className="flex items-start gap-4">
      <span className={itemStyles.numberStyle}>{number}</span>
      <div>
        <strong className={itemStyles.titleStyle}>{title}</strong>
        <p className={itemStyles.descriptionStyle}>{description}</p>
      </div>
    </li>
  );
});

AnalysisMethodItem.displayName = 'AnalysisMethodItem';

// 优化的技巧项组件
const TechniqueItem = React.memo<{
  icon: string;
  title: string;
  description: string;
}>(({ icon, title, description }) => {
  const itemStyles = useMemo(() => ({
    titleStyle: 'text-lg font-bold text-slate-700 mb-3',
    descriptionStyle: 'text-slate-600 leading-relaxed'
  }), []);

  return (
    <div>
      <h4 className={itemStyles.titleStyle}>{icon} {title}</h4>
      <p className={itemStyles.descriptionStyle}>{description}</p>
    </div>
  );
});

TechniqueItem.displayName = 'TechniqueItem';

// 优化的提示卡片组件
const TipCard = React.memo<{
  number: number;
  title: string;
  description: string;
}>(({ number, title, description }) => {
  const cardStyles = useMemo(() => ({
    containerStyle: 'text-center space-y-4',
    numberStyle: 'w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg border border-slate-200',
    titleStyle: 'text-xl font-bold text-slate-800 mb-2',
    descriptionStyle: 'text-slate-600 leading-relaxed'
  }), []);

  return (
    <div className={cardStyles.containerStyle}>
      <div className={cardStyles.numberStyle}>{number}</div>
      <h4 className={cardStyles.titleStyle}>{title}</h4>
      <p className={cardStyles.descriptionStyle}>{description}</p>
    </div>
  );
});

TipCard.displayName = 'TipCard';

const FAQ: React.FC = React.memo(() => {
  const headerContent = useMemo(() => (
    <h2 className="text-4xl font-bold text-slate-800 mb-16 text-center">🔧 Troubleshooting & FAQ</h2>
  ), []);

  // 缓存分析方法数据
  const analysisMethodsData = useMemo(() => [
    {
      number: 1,
      title: 'Re-examine Intersection Points',
      description: 'Check if letters at each intersection can satisfy both words simultaneously'
    },
    {
      number: 2,
      title: 'Analyze Yellow Letter Positions',
      description: 'Yellow letters belong to the word but are in wrong positions, try different arrangements'
    },
    {
      number: 3,
      title: 'Consider Common Word Patterns',
      description: 'Think of common 5-letter English words, especially those starting or ending with known letters'
    },
    {
      number: 4,
      title: 'Check Remaining Swaps',
      description: 'Ensure you have enough moves left to complete the puzzle'
    }
  ], []);

  // 缓存突破技巧数据
  const techniquesData = useMemo(() => [
    {
      icon: '🔍',
      title: 'Pause and Think Method',
      description: 'When feeling confused, stop and re-observe the entire grid, looking for previously overlooked clues'
    },
    {
      icon: '🔄',
      title: 'Reverse Reasoning Method',
      description: 'Start with the most likely words and work backwards to determine which letters need to be in which positions'
    },
    {
      icon: '❌',
      title: 'Elimination Method',
      description: 'List impossible letter combinations to narrow down the choices'
    },
    {
      icon: '🧩',
      title: 'Pattern Recognition Method',
      description: 'Look for common letter combinations like "TH", "ER", "ING", etc.'
    }
  ], []);

  // 缓存快速提示数据
  const quickTipsData = useMemo(() => [
    {
      number: 1,
      title: 'Observe First',
      description: 'Taking time to observe is more effective than blind swapping'
    },
    {
      number: 2,
      title: 'Focus on Intersections',
      description: 'Solving intersections is often the key breakthrough'
    },
    {
      number: 3,
      title: 'Stay Patient',
      description: 'Complex puzzles require time and strategy'
    }
  ], []);

  // 缓存样式类名
  const containerStyles = useMemo(() => ({
    mainContainer: 'py-20 px-6',
    maxWidthContainer: 'max-w-6xl mx-auto',
    gridContainer: 'grid lg:grid-cols-2 gap-16 mb-12',
    spaceContainer: 'space-y-8',
    sectionTitle: 'text-2xl font-bold text-slate-800 mb-8',
    listContainer: 'space-y-6',
    techniquesContainer: 'space-y-6',
    bottomSection: 'pt-16 border-t border-slate-300',
    bottomTitle: 'text-2xl font-bold text-slate-800 mb-12 text-center',
    tipsGrid: 'grid lg:grid-cols-3 gap-8'
  }), []);

  return (
    <div className={containerStyles.mainContainer}>
      <div className={containerStyles.maxWidthContainer}>
        {headerContent}

        <div className={containerStyles.gridContainer}>
          <div className={containerStyles.spaceContainer}>
            <h3 className={containerStyles.sectionTitle}>🤔 Analysis Methods When Stuck</h3>
            <ol className={containerStyles.listContainer}>
              {analysisMethodsData.map((item) => (
                <AnalysisMethodItem
                  key={item.number}
                  number={item.number}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </ol>
          </div>

          <div className={containerStyles.spaceContainer}>
            <h3 className={containerStyles.sectionTitle}>💡 Breakthrough Techniques</h3>
            <div className={containerStyles.techniquesContainer}>
              {techniquesData.map((item, index) => (
                <TechniqueItem
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={containerStyles.bottomSection}>
          <h3 className={containerStyles.bottomTitle}>🚀 Quick Tips for Success</h3>
          <div className={containerStyles.tipsGrid}>
            {quickTipsData.map((tip) => (
              <TipCard
                key={tip.number}
                number={tip.number}
                title={tip.title}
                description={tip.description}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;
