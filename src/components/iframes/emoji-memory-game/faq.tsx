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
    answer: 'Emoji Memory Game is an innovative digital adaptation of the beloved classic memory card game designed for cognitive enhancement. In this advanced Emoji Memory Game, players flip vibrant, colorful emoji cards to discover matching pairs through strategic gameplay. Unlike traditional memory games, this Emoji Memory Game uses expressive, high-quality emojis that create a more engaging and visually stimulating brain training experience. The primary objective in Emoji Memory Game is to match all emoji pairs within the allocated time while minimizing your total moves for optimal Emoji Memory Game performance and cognitive development.',
    category: 'general',
    tags: ['basics', 'overview', 'introduction']
  },
  {
    id: 'how-start-game',
    question: 'How do I start playing Emoji Memory Game?',
    answer: 'Starting your Emoji Memory Game adventure is simple and intuitive! First, select your preferred difficulty level (Beginner, Intermediate, Advanced, or Expert) to customize your personalized Emoji Memory Game experience. Click any emoji card to begin your Emoji Memory Game session, and the timer automatically starts with your first strategic move. In this engaging Emoji Memory Game, you flip two emoji cards at a time to discover matching pairs and progress through increasingly challenging Emoji Memory Game levels designed to enhance cognitive abilities.',
    category: 'gameplay',
    tags: ['start', 'begin', 'first-time']
  },
  {
    id: 'difficulty-differences',
    question: 'What are the differences between Emoji Memory Game difficulty levels?',
    answer: 'Emoji Memory Game offers four distinct difficulty levels, each carefully designed to challenge different cognitive skill levels and brain training goals. Beginner Emoji Memory Game starts with 2 emoji pairs and 90 seconds for newcomers. Intermediate Emoji Memory Game features 4 pairs with 150 seconds for developing players. Advanced Emoji Memory Game challenges experienced users with 8 pairs in 210 seconds. Expert Emoji Memory Game presents the ultimate cognitive test with 10 pairs and 300 seconds for master-level players. Higher difficulties in this comprehensive Emoji Memory Game provide additional initial time and enhanced bonus time rewards between challenging levels.',
    category: 'gameplay',
    tags: ['difficulty', 'levels', 'comparison']
  },
  {
    id: 'scoring-system',
    question: 'How does the Emoji Memory Game scoring system work?',
    answer: 'In Emoji Memory Game, your performance is measured by the number of moves (card flips) you make. Fewer moves in Emoji Memory Game indicate superior performance and cognitive efficiency. The Emoji Memory Game also tracks your completion time, which affects bonus time calculations for subsequent levels. Unlike traditional games, Emoji Memory Game focuses on efficiency rather than points - the challenge is to complete Emoji Memory Game levels with optimal move counts.',
    category: 'scoring',
    tags: ['score', 'moves', 'performance']
  },
  {
    id: 'bonus-time-calculation',
    question: 'How is Emoji Memory Game bonus time calculated?',
    answer: 'Emoji Memory Game bonus time is awarded between levels based on your recent performance efficiency. Each difficulty has a base bonus time allocation, and the actual bonus is dynamically adjusted based on how quickly you completed recent levels. Consistently excellent performance increases your bonus time rewards, while slower completion may reduce future time bonuses.',
    category: 'scoring',
    tags: ['bonus', 'time', 'calculation', 'performance']
  },
  {
    id: 'game-controls',
    question: 'What are the Emoji Memory Game controls?',
    answer: 'Emoji Memory Game is controlled entirely with intuitive mouse clicks or touch taps for seamless gameplay. Click on emoji cards to flip them in your session, use the restart button to reset your current game, and select difficulty levels from the top controls. The game automatically progresses to the next level when you successfully complete all emoji pairs.',
    category: 'gameplay',
    tags: ['controls', 'mouse', 'touch', 'interface']
  },
  {
    id: 'timer-behavior',
    question: 'When does the Emoji Memory Game timer start and stop?',
    answer: 'The timer starts when you flip your first card and continues until you complete the level, run out of time, or restart the game. The timer pauses during level transition dialogs and when the game is not active. Each level has its own time limit plus any bonus time earned.',
    category: 'gameplay',
    tags: ['timer', 'time', 'countdown']
  },
  {
    id: 'level-progression',
    question: 'How do Emoji Memory Game levels progress?',
    answer: 'Each level increases the number of card pairs you need to match. The progression follows a sequence: 2, 3, 4, 5, 6, 8, 9, 10, 12, 15 pairs, and then continues adding 3 pairs per level. Higher levels become increasingly challenging as more cards are added to the grid.',
    category: 'gameplay',
    tags: ['levels', 'progression', 'difficulty']
  },
  {
    id: 'game-over-conditions',
    question: 'When does the Emoji Memory Game end?',
    answer: 'The game ends when your timer reaches zero before you complete all pairs. You can then choose to restart from level 1 or continue practicing. There\'s no limit to how many levels you can complete - the game continues indefinitely as long as you have time remaining.',
    category: 'gameplay',
    tags: ['game-over', 'end', 'restart']
  },
  {
    id: 'browser-compatibility',
    question: 'Which browsers support Emoji Memory Game?',
    answer: 'The Emoji Memory Game works on all modern web browsers including Chrome, Firefox, Safari, and Edge. It\'s also optimized for mobile devices and tablets. For the best Emoji Memory Game experience, we recommend using the latest version of your preferred browser.',
    category: 'technical',
    tags: ['browser', 'compatibility', 'mobile']
  },
  {
    id: 'mobile-experience',
    question: 'Can I play Emoji Memory Game on mobile devices?',
    answer: 'Yes! The game is fully responsive and optimized for mobile phones and tablets. Touch controls work seamlessly, and the layout automatically adjusts to your screen size. The gaming experience is identical across all devices.',
    category: 'technical',
    tags: ['mobile', 'tablet', 'responsive', 'touch']
  },
  {
    id: 'data-storage',
    question: 'Does the Emoji Memory Game save my progress?',
    answer: 'The game runs entirely in your browser session and doesn\'t permanently save progress between visits. Each time you start, you begin fresh. This ensures privacy and allows multiple people to play on the same device without interference.',
    category: 'technical',
    tags: ['save', 'progress', 'data', 'privacy']
  },
  {
    id: 'performance-tips',
    question: 'How can I improve my Emoji Memory Game performance?',
    answer: 'Mastering Emoji Memory Game requires strategic thinking, consistent practice, and dedicated brain training techniques. Use systematic card flipping patterns (row-by-row approach) in your daily sessions for optimal results. Focus on memorizing unique emoji positions and prioritize matching pairs for emojis you\'ve encountered multiple times during gameplay. Begin with easier difficulties to develop foundational memory skills, then gradually advance to more challenging levels as your cognitive abilities strengthen through regular practice and mental training exercises.',
    category: 'general',
    tags: ['tips', 'strategy', 'improvement', 'memory']
  },
  {
    id: 'sound-effects',
    question: 'Can I control Emoji Memory Game sound effects?',
    answer: 'The game includes sound effects for card flips, matches, and game events. Sound controls depend on your browser\'s audio settings. You can mute the tab or adjust your device\'s volume to control the audio experience.',
    category: 'technical',
    tags: ['sound', 'audio', 'effects', 'volume']
  },
  {
    id: 'accessibility',
    question: 'Is the Emoji Memory Game accessible?',
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
          <h1 className="text-3xl font-bold text-gray-900">Emoji Memory Game FAQ - Complete Guide & Expert Answers</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover comprehensive answers to the most common Emoji Memory Game questions and challenges. 
          Master advanced Emoji Memory Game strategies, understand complex scoring systems, and optimize your entire Emoji Memory Game experience. 
          Need additional Emoji Memory Game help? Explore our complete Emoji Memory Game Help Center with expert tutorials!
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Still Have Emoji Memory Game Questions or Need Expert Help?</h3>
          <p className="text-gray-600 text-sm">
            These comprehensive Emoji Memory Game FAQs address the most frequently asked questions about this brain training game. 
            For detailed Emoji Memory Game guides, advanced cognitive strategies, and complete Emoji Memory Game tutorials, 
            explore our extensive Emoji Memory Game Help Center featuring expert tips, winning techniques, and professional gameplay insights.
          </p>
        </div>
      </div>
    </div>
  )
})

FAQ.displayName = 'FAQ'