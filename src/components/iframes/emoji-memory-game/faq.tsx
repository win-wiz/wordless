'use client'

import { memo, useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  ChevronUp,
  MessageCircleQuestion,
  Search,
  Filter,
  Clock,
  GamepadIcon,
  Settings,
  Trophy,
  HelpCircle
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'gameplay' | 'technical' | 'scoring' | 'general'
  tags: string[]
}

const FAQ_CATEGORIES = {
  gameplay: { label: 'Gameplay', icon: GamepadIcon, color: 'bg-blue-500' },
  technical: { label: 'Technical', icon: Settings, color: 'bg-green-500' },
  scoring: { label: 'Scoring', icon: Trophy, color: 'bg-yellow-500' },
  general: { label: 'General', icon: HelpCircle, color: 'bg-purple-500' }
} as const

const FAQ_DATA: FAQItem[] = [
  {
    id: 'what-is-game',
    question: 'What is Emoji Memory Game?',
    answer: 'Emoji Memory Game is a digital version of the classic memory card game where you flip cards to find matching pairs. Instead of traditional images, we use colorful emojis to make the game more fun and engaging. The goal is to match all pairs within the time limit while using as few moves as possible.',
    category: 'general',
    tags: ['basics', 'overview', 'introduction']
  },
  {
    id: 'how-start-game',
    question: 'How do I start playing?',
    answer: 'Simply choose your preferred difficulty level (Beginner, Intermediate, Advanced, or Expert) and click on any card to begin. The timer starts when you make your first move. Try to find matching emoji pairs by flipping two cards at a time.',
    category: 'gameplay',
    tags: ['start', 'begin', 'first-time']
  },
  {
    id: 'difficulty-differences',
    question: 'What are the differences between difficulty levels?',
    answer: 'Each difficulty level has different starting parameters: Beginner (2 pairs, 90s), Intermediate (4 pairs, 150s), Advanced (8 pairs, 210s), and Expert (10 pairs, 300s). Higher difficulties have more cards but also provide more initial time and bonus time between levels.',
    category: 'gameplay',
    tags: ['difficulty', 'levels', 'comparison']
  },
  {
    id: 'scoring-system',
    question: 'How does the scoring system work?',
    answer: 'Your performance is measured by the number of moves (card flips) you make. Fewer moves indicate better performance. The game also tracks your completion time, which affects bonus time calculations for subsequent levels. There\'s no traditional point system - the challenge is to complete levels efficiently.',
    category: 'scoring',
    tags: ['score', 'moves', 'performance']
  },
  {
    id: 'bonus-time-calculation',
    question: 'How is bonus time calculated?',
    answer: 'Bonus time is awarded between levels based on your recent performance. Each difficulty has a base bonus time, and the actual bonus is adjusted based on how quickly you completed recent levels. Consistently good performance increases your bonus time, while slower completion may reduce it.',
    category: 'scoring',
    tags: ['bonus', 'time', 'calculation', 'performance']
  },
  {
    id: 'game-controls',
    question: 'What are the game controls?',
    answer: 'The game is controlled entirely with mouse clicks or touch taps. Click on cards to flip them, use the restart button to reset the current game, and select difficulty levels from the top controls. The game automatically progresses to the next level when you complete all pairs.',
    category: 'gameplay',
    tags: ['controls', 'mouse', 'touch', 'interface']
  },
  {
    id: 'timer-behavior',
    question: 'When does the timer start and stop?',
    answer: 'The timer starts when you flip your first card and continues until you complete the level, run out of time, or restart the game. The timer pauses during level transition dialogs and when the game is not active. Each level has its own time limit plus any bonus time earned.',
    category: 'gameplay',
    tags: ['timer', 'time', 'countdown']
  },
  {
    id: 'level-progression',
    question: 'How do levels progress?',
    answer: 'Each level increases the number of card pairs you need to match. The progression follows a sequence: 2, 3, 4, 5, 6, 8, 9, 10, 12, 15 pairs, and then continues adding 3 pairs per level. Higher levels become increasingly challenging as more cards are added to the grid.',
    category: 'gameplay',
    tags: ['levels', 'progression', 'difficulty']
  },
  {
    id: 'game-over-conditions',
    question: 'When does the game end?',
    answer: 'The game ends when your timer reaches zero before you complete all pairs. You can then choose to restart from level 1 or continue practicing. There\'s no limit to how many levels you can complete - the game continues indefinitely as long as you have time remaining.',
    category: 'gameplay',
    tags: ['game-over', 'end', 'restart']
  },
  {
    id: 'browser-compatibility',
    question: 'Which browsers are supported?',
    answer: 'The game works on all modern web browsers including Chrome, Firefox, Safari, and Edge. It\'s also optimized for mobile devices and tablets. For the best experience, we recommend using the latest version of your preferred browser.',
    category: 'technical',
    tags: ['browser', 'compatibility', 'mobile']
  },
  {
    id: 'mobile-experience',
    question: 'Can I play on mobile devices?',
    answer: 'Yes! The game is fully responsive and optimized for mobile phones and tablets. Touch controls work seamlessly, and the layout automatically adjusts to your screen size. The game experience is identical across all devices.',
    category: 'technical',
    tags: ['mobile', 'tablet', 'responsive', 'touch']
  },
  {
    id: 'data-storage',
    question: 'Does the game save my progress?',
    answer: 'The game runs entirely in your browser session and doesn\'t permanently save progress between visits. Each time you start, you begin fresh. This ensures privacy and allows multiple people to play on the same device without interference.',
    category: 'technical',
    tags: ['save', 'progress', 'data', 'privacy']
  },
  {
    id: 'performance-tips',
    question: 'How can I improve my performance?',
    answer: 'Practice systematic card flipping (like going row by row), focus on remembering positions of unique emojis, and try to match pairs for emojis you\'ve seen multiple times. Start with easier difficulties to build your memory skills before advancing to harder levels.',
    category: 'general',
    tags: ['tips', 'strategy', 'improvement', 'memory']
  },
  {
    id: 'sound-effects',
    question: 'Can I control sound effects?',
    answer: 'The game includes sound effects for card flips, matches, and game events. Sound controls depend on your browser\'s audio settings. You can mute the tab or adjust your device\'s volume to control the audio experience.',
    category: 'technical',
    tags: ['sound', 'audio', 'effects', 'volume']
  },
  {
    id: 'accessibility',
    question: 'Is the game accessible?',
    answer: 'The game is designed with accessibility in mind, featuring high contrast colors, clear visual indicators, and keyboard-friendly navigation. The emoji cards are large enough for easy interaction, and the interface works well with screen readers.',
    category: 'technical',
    tags: ['accessibility', 'screen-reader', 'contrast']
  }
]

interface FAQCardProps {
  item: FAQItem
  isExpanded: boolean
  onToggle: () => void
}

const FAQCard = memo(function FAQCard({ item, isExpanded, onToggle }: FAQCardProps) {
  const category = FAQ_CATEGORIES[item.category]
  
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      "border border-gray-200 bg-white",
      isExpanded && "shadow-lg border-purple-200"
    )}>
      <button
        onClick={onToggle}
        className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "p-1.5 rounded-lg text-white text-xs",
                category.color
              )}>
                <category.icon className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {category.label}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {item.question}
            </h3>
            {!isExpanded && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.answer.substring(0, 120)}...
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
          <div className="pt-4 border-t border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-4">
              {item.answer}
            </p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
})

interface FAQProps {
  className?: string
  onClose?: () => void
}

export const FAQ = memo(function FAQ({ className, onClose }: FAQProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const toggleItem = useCallback((id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])
  
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])
  
  const categories = useMemo(() => [
    { id: 'all', label: 'All Categories', icon: Filter },
    ...Object.entries(FAQ_CATEGORIES).map(([id, config]) => ({
      id,
      label: config.label,
      icon: config.icon
    }))
  ], [])
  
  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto p-6",
      className
    )}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
            <MessageCircleQuestion className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find quick answers to common questions about Emoji Memory Game. 
          Can't find what you're looking for? Check out our Help Center!
        </p>
        {onClose && (
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mt-4"
          >
            Back to Game
          </Button>
        )}
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search questions, answers, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </Button>
            )
          })}
        </div>
      </div>
      
      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((item) => (
            <FAQCard
              key={item.id}
              item={item}
              isExpanded={expandedItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircleQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Still Have Questions?</h3>
          <p className="text-gray-600 text-sm">
            These FAQs cover the most common questions about Emoji Memory Game. 
            For more detailed information, visit our comprehensive Help Center.
          </p>
        </div>
      </div>
    </div>
  )
})

FAQ.displayName = 'FAQ'