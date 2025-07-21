'use client'

import { memo, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HelpCenter } from './help-center'
import { FAQ } from './faq'
import { 
  BookOpen, 
  MessageCircleQuestion, 
  ArrowLeft,
  HelpCircle,
  Lightbulb,
  Users
} from 'lucide-react'

type HelpSection = 'overview' | 'help-center' | 'faq'

interface HelpNavigationProps {
  currentSection: HelpSection
  onSectionChange: (section: HelpSection) => void
  onClose?: () => void
}

const HelpNavigation = memo(function HelpNavigation({ 
  currentSection, 
  onSectionChange, 
  onClose 
}: HelpNavigationProps) {
  const sections = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: HelpCircle,
      description: 'Quick introduction'
    },
    {
      id: 'help-center' as const,
      label: 'Help Center',
      icon: BookOpen,
      description: 'Comprehensive guides'
    },
    {
      id: 'faq' as const,
      label: 'FAQ',
      icon: MessageCircleQuestion,
      description: 'Common questions'
    }
  ]
  
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </Button>
        )}
        <div className="h-6 w-px bg-gray-300" />
        <nav className="flex items-center gap-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Button
                key={section.id}
                variant={currentSection === section.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onSectionChange(section.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
})

interface HelpOverviewProps {
  onSectionChange: (section: HelpSection) => void
}

const HelpOverview = memo(function HelpOverview({ onSectionChange }: HelpOverviewProps) {
  const features = [
    {
      title: 'Help Center',
      description: 'Comprehensive guides covering all aspects of the game, from basic gameplay to advanced strategies.',
      icon: BookOpen,
      action: () => onSectionChange('help-center'),
      buttonText: 'Explore Guides',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'FAQ',
      description: 'Quick answers to the most frequently asked questions about gameplay, scoring, and technical issues.',
      icon: MessageCircleQuestion,
      action: () => onSectionChange('faq'),
      buttonText: 'Browse FAQ',
      color: 'from-blue-500 to-purple-500'
    }
  ]
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
            <HelpCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Help & Support</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Welcome to Emoji Memory Game! Whether you're a beginner looking to learn the basics 
          or an experienced player seeking advanced strategies, we've got you covered.
        </p>
      </div>
      
      {/* Game Introduction */}
      <div className="mb-12 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
        <div className="flex items-start gap-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg flex-shrink-0">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">What is Emoji Memory Game?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Emoji Memory Game is a modern twist on the classic memory card game. Instead of traditional cards, 
              you'll be matching colorful emoji pairs! The game challenges your memory and concentration skills 
              while providing hours of entertaining gameplay.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Multiple difficulty levels for all skill levels</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Progressive level system with increasing challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Time-based gameplay with bonus rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Optimized for both desktop and mobile devices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="p-8 h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-200">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "p-3 rounded-xl text-white shadow-lg bg-gradient-to-br",
                    feature.color
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  {feature.description}
                </p>
                <Button 
                  onClick={feature.action}
                  className="w-full"
                >
                  {feature.buttonText}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
      
      {/* Quick Tips */}
      <div className="p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
        <div className="flex items-start gap-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg flex-shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Quick Start Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">For Beginners:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Start with the Beginner difficulty level</li>
                  <li>• Take your time to observe card positions</li>
                  <li>• Focus on systematic card flipping patterns</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">For Advanced Players:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Challenge yourself with Expert difficulty</li>
                  <li>• Optimize your moves for better performance</li>
                  <li>• Use memory techniques to track card positions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

interface HelpProps {
  className?: string
  onClose?: () => void
  initialSection?: HelpSection
}

export const Help = memo(function Help({ 
  className, 
  onClose,
  initialSection = 'overview'
}: HelpProps) {
  const [currentSection, setCurrentSection] = useState<HelpSection>(initialSection)
  
  const handleSectionChange = useCallback((section: HelpSection) => {
    setCurrentSection(section)
  }, [])
  
  const renderContent = () => {
    switch (currentSection) {
      case 'help-center':
        return <HelpCenter onClose={onClose} />
      case 'faq':
        return <FAQ onClose={onClose} />
      default:
        return <HelpOverview onSectionChange={handleSectionChange} />
    }
  }
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30",
      className
    )}>
      <div className="container mx-auto px-4 py-8">
        <HelpNavigation 
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          onClose={onClose}
        />
        <div className="animate-in fade-in-50 duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  )
})

Help.displayName = 'Help'

// Export individual components for direct use
export { HelpCenter, FAQ }
export type { HelpSection }