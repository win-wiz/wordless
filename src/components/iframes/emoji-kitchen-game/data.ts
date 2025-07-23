// ==================== Type Definitions ====================
export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  category: string;
  benefits: string[];
}

export interface StepItem {
  title: string;
  description: string;
  tips: string[];
  example?: string;
}

export interface TipItem {
  icon: string;
  title: string;
  content: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// ==================== Data Configuration ====================
export const FEATURES_DATA: FeatureItem[] = [
  {
    icon: '🤖',
    title: 'AI-Powered Emoji Kitchen',
    description: 'The Emoji Kitchen Game uses advanced AI technology to intelligently blend any two emojis into unique creative expressions that perfectly showcase your personality and style.',
    category: 'Core Feature',
    benefits: ['Unlimited creative combinations', 'Smart emoji blending algorithm', 'High-quality Emoji Kitchen Game results']
  },
  {
    icon: '🎲',
    title: 'Random Emoji Kitchen Discovery',
    description: 'Explore endless possibilities in the Emoji Kitchen Game through our random generator, discovering surprising emoji combinations you never imagined and sparking creative inspiration.',
    category: 'Core Feature', 
    benefits: ['Unexpected emoji pairings', 'Creative inspiration boost', 'Quick Emoji Kitchen exploration']
  },
  {
    icon: '💖',
    title: 'Emoji Kitchen Collection System',
    description: 'Save your favorite Emoji Kitchen Game creations, build your personal emoji collection, and access them anytime to share with friends and family.',
    category: 'Core Feature',
    benefits: ['Secure local storage', 'Quick access to favorites', 'Personalized Emoji Kitchen management']
  },
  {
    icon: '📤',
    title: 'One-Click Emoji Sharing',
    description: 'The Emoji Kitchen Game supports multi-platform sharing with one click, generating QR codes or copyable links to instantly spread your creative emoji combinations.',
    category: 'Sharing Feature',
    benefits: ['Multi-platform compatibility', 'Instant QR code generation', 'Easy Emoji Kitchen link sharing']
  },
  {
    icon: '📸',
    title: 'HD Emoji Kitchen Downloads',
    description: 'Download high-resolution Emoji Kitchen Game creations, perfect for messaging apps, social media posts, or creative digital projects.',
    category: 'Sharing Feature',
    benefits: ['High-quality emoji outputs', 'Multiple format options', 'Commercial-friendly usage']
  },
  {
    icon: '📱',
    title: 'Cross-Device Emoji Kitchen',
    description: 'The Emoji Kitchen Game\'s responsive design ensures perfect operation on phones, tablets, and computers, so you can enjoy creating emoji combinations anywhere, anytime.',
    category: 'User Experience',
    benefits: ['Seamless cross-device experience', 'Touch-optimized interface', 'Fast Emoji Kitchen loading']
  }
];

export const STEPS_DATA: StepItem[] = [
  {
    title: 'Select Your First Emoji in Kitchen',
    description: 'Browse the Emoji Kitchen Game\'s extensive library and select your first emoji to start the creation process.',
    tips: ['Use the Emoji Kitchen search function for quick emoji location', 'Browse by emoji category for efficient selection', 'Any emoji in the Emoji Kitchen Game can be your starting point']
  },
  {
    title: 'Choose Your Second Emoji',
    description: 'In the Emoji Kitchen Game, select a second emoji to combine with your first choice for a unique blend.',
    tips: ['Try unexpected emoji combinations in the Kitchen', 'Contrasting emojis often create the most interesting Kitchen results', 'Experiment with different emoji categories for diverse outcomes']
  },
  {
    title: 'Generate Your Emoji Kitchen Creation',
    description: 'The Emoji Kitchen Game\'s AI will process your emoji pair and create a unique combination in seconds.',
    example: 'Combine 🐱 + 🍕 in the Emoji Kitchen Game to get a delightful pizza cat!',
    tips: ['Wait briefly for the Emoji Kitchen AI to process your selection', 'Complex emoji combinations may take slightly longer', 'Results vary based on the emoji complexity in the Kitchen']
  },
  {
    title: 'Save & Share Your Kitchen Creation',
    description: 'Download your Emoji Kitchen Game creation, add it to favorites, or share it directly with friends and family.',
    tips: ['High-resolution Emoji Kitchen downloads available for all creations', 'Share to multiple platforms directly from the Emoji Kitchen Game', 'Create themed collections of your favorite Kitchen combinations']
  }
];

export const TIPS_DATA: TipItem[] = [
  {
    icon: '🔍',
    title: 'Use Emoji Kitchen Categories',
    content: 'Browse the Emoji Kitchen Game by category to quickly find the perfect starting point for your creative emoji combinations.'
  },
  {
    icon: '⚡',
    title: 'Try Contrasting Emoji Pairs',
    content: 'In the Emoji Kitchen Game, combining contrasting emojis (like animals with food) often creates the most surprising and delightful results.'
  },
  {
    icon: '🔄',
    title: 'Reverse Emoji Kitchen Order',
    content: 'Try reversing the order of your emoji selections in the Emoji Kitchen Game - the results can be completely different!'
  },
  {
    icon: '📚',
    title: 'Create Emoji Kitchen Collections',
    content: 'Organize your favorite Emoji Kitchen Game creations into themed collections for easy access and sharing with friends.'
  },
  {
    icon: '🎨',
    title: 'Explore Emoji Kitchen Color Themes',
    content: 'In the Emoji Kitchen Game, try combining emojis with similar color schemes for visually harmonious and aesthetically pleasing results.'
  },
  {
    icon: '🎭',
    title: 'Express Emotions with Emoji Kitchen',
    content: 'Create custom emotional expressions in the Emoji Kitchen Game by combining face emojis with objects that represent specific feelings.'
  }
];

export const FAQ_DATA: FaqItem[] = [
  {
    question: '🤔 Is the Emoji Kitchen Game completely free to use?',
    answer: 'Yes, the Emoji Kitchen Game is 100% free with no registration or payment required. Create unlimited Emoji Kitchen Game combinations at no cost and enjoy all premium features.'
  },
  {
    question: '📱 Does the Emoji Kitchen Game work on all mobile devices?',
    answer: 'Absolutely! The Emoji Kitchen Game features responsive design that works flawlessly across all devices - smartphones, tablets, and desktop computers - for seamless Emoji Kitchen Game creation anywhere.'
  },
  {
    question: '💾 How are my Emoji Kitchen Game creations saved?',
    answer: 'Your Emoji Kitchen Game collections and creation history are securely saved locally on your device, ensuring complete privacy and easy access to all your favorite Emoji Kitchen Game combinations.'
  }
];

// Color configurations for step cards
export const STEP_COLORS = [
  'from-green-500 to-emerald-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-violet-500',
  'from-pink-500 to-rose-500'
];

export const STEP_BG_COLORS = [
  'from-green-50 to-emerald-50',
  'from-blue-50 to-cyan-50', 
  'from-purple-50 to-violet-50',
  'from-pink-50 to-rose-50'
];

export const STEP_SHADOW_COLORS = [
  'shadow-green-200/50',
  'shadow-blue-200/50',
  'shadow-purple-200/50',
  'shadow-pink-200/50'
];