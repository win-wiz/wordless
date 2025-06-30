import { memo } from 'react';

interface ColorLegendItemProps {
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  description: string;
}

const ColorLegendItem = memo(function ColorLegendItem({ 
  color, 
  bgColor, 
  borderColor, 
  title, 
  description 
}: ColorLegendItemProps) {
  return (
    <div className={`${bgColor} p-6 rounded-lg border-l-4 ${borderColor}`}>
      <div className="flex items-center mb-2">
        <div className={`w-4 h-4 ${color} rounded-full mr-3`}></div>
        <span className={`font-semibold ${title.includes('green') ? 'text-green-700' : title.includes('yellow') ? 'text-yellow-700' : 'text-zinc-700'}`}>
          {title}
        </span>
      </div>
      <p className={`text-sm ${description.includes('green') ? 'text-green-600' : description.includes('yellow') ? 'text-yellow-600' : 'text-zinc-600'}`}>
        {description}
      </p>
    </div>
  );
});

const ColorLegend = memo(function ColorLegend() {
  const legendItems = [
    {
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      title: 'Correct Spot',
      description: 'Letter is in the right position'
    },
    {
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      title: 'Wrong Spot',
      description: 'Letter exists but wrong position'
    },
    {
      color: 'bg-zinc-400',
      bgColor: 'bg-zinc-50',
      borderColor: 'border-zinc-400',
      title: 'Not Found',
      description: 'Letter is not in the word'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {legendItems.map((item, index) => (
        <ColorLegendItem
          key={index}
          color={item.color}
          bgColor={item.bgColor}
          borderColor={item.borderColor}
          title={item.title}
          description={item.description}
        />
      ))}
    </div>
  );
});

export default ColorLegend; 