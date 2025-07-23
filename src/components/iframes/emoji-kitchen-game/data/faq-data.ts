import { FAQItem } from '../types';

export const faqData: FAQItem[] = [
  {
    question: 'What is Emoji Kitchen Game?',
    answer: 'The Emoji Kitchen Game is an innovative AI-powered web application that lets you combine any two emojis to create unique, creative emoji combinations. Think of it as a digital kitchen where emojis are your ingredients and creativity is your recipe! The Emoji Kitchen Game uses advanced AI technology to analyze the visual and semantic properties of your selected emojis, creating seamless blends that express your personality.',
    category: 'general'
  },
  {
    question: 'How do I start creating emoji combinations in the Emoji Kitchen Game?',
    answer: {
      intro: 'Getting started with the Emoji Kitchen Game is simple, intuitive, and fun:',
      list: [
        'Browse through the Emoji Kitchen Game\'s extensive emoji library and select your first emoji',
        'Use the Emoji Kitchen search function to quickly find specific emojis or explore different categories',
        'Pick a second emoji to combine with your first choice in the Emoji Kitchen interface',
        'The Emoji Kitchen Game\'s AI will process your emoji pair and create a unique combination in just a few seconds'
      ]
    },
    category: 'usage'
  },
  {
    question: 'How does the Emoji Kitchen Game\'s AI combination technology work?',
    answer: 'The Emoji Kitchen Game\'s advanced AI technology uses sophisticated machine learning algorithms to analyze the visual characteristics, semantic meaning, and cultural context of emojis. The Emoji Kitchen system then creates a seamless blend that maintains the essence of both original emojis while generating something entirely new and unique. The Emoji Kitchen Game\'s process considers color schemes, shapes, expressions, and symbolic meanings for optimal results.',
    category: 'technical'
  },
  {
    question: 'Can I save and organize my Emoji Kitchen Game creations?',
    answer: {
      intro: 'Absolutely! The Emoji Kitchen Game gives you full control over your emoji creations:',
      list: [
        'Download your Emoji Kitchen combinations as high-quality PNG images',
        'Add your favorite Emoji Kitchen creations to your personal collection',
        'Your Emoji Kitchen Game favorites are stored locally on your device for complete privacy',
        'Access your Emoji Kitchen collection anytime and organize it however you like',
        'Easily search through your saved Emoji Kitchen Game creations'
      ]
    },
    category: 'usage'
  },
  {
    question: 'Is there a limit to how many combinations I can create in the Emoji Kitchen Game?',
    answer: 'No limits at all! You can create as many Emoji Kitchen Game combinations as you want. Experiment with different emoji pairs, use the Emoji Kitchen Game\'s random generator for inspiration, and build an extensive collection of unique emoji creations. The Emoji Kitchen Game encourages creativity and exploration – the more you experiment in the Kitchen, the more amazing emoji combinations you\'ll discover!',
    category: 'usage'
  },
  {
    question: 'What sharing options are available in the Emoji Kitchen Game?',
    answer: {
      intro: 'The Emoji Kitchen Game offers multiple convenient sharing options:',
      list: [
        'Share your Emoji Kitchen creations directly to popular social media platforms like Twitter, Facebook, and WeChat with one click',
        'Generate QR codes for easy mobile sharing of your Emoji Kitchen combinations',
        'Copy direct links to share your Emoji Kitchen Game creations with friends',
        'Download your Emoji Kitchen images to share manually across any platform',
        'Each Emoji Kitchen Game sharing method is optimized for the best quality and user experience'
      ]
    },
    category: 'sharing'
  },
  {
    question: 'Does the app work on mobile devices?',
    answer: {
      intro: 'Yes! Our app is fully optimized for all devices:',
      list: [
        'Smooth performance on smartphones and tablets',
        'Responsive design that adapts to your screen size',
        'Intuitive touch controls for easy emoji selection',
        'Fast loading and reliable mobile browser experience',
        'All features work seamlessly across platforms'
      ]
    },
    category: 'technical'
  },
  {
    question: 'Are my creations and data private?',
    answer: 'Your privacy is our priority! All your emoji combinations and favorites are stored locally on your device. We don\'t store your personal creations on our servers, ensuring complete privacy and giving you full control over your emoji collection. Your creative work stays yours.',
    category: 'privacy'
  },
  {
    question: 'Can I use the random emoji generator?',
    answer: 'Yes! Our random emoji generator is perfect for discovering unexpected and creative combinations. Click the random button to automatically select emoji pairs, and let our AI surprise you with unique results. It\'s a great way to find inspiration and explore combinations you might never have thought of!',
    category: 'usage'
  },
  {
    question: 'What image quality can I expect for downloads?',
    answer: 'All emoji combinations are generated and available for download in high resolution PNG format. The images are optimized for clarity and quality, making them perfect for use in messages, social media posts, presentations, or any creative projects you have in mind.',
    category: 'technical'
  },
  {
    question: 'Can I use created emojis for commercial purposes?',
    answer: 'The emoji combinations you create are primarily intended for personal use. For commercial usage, please ensure you comply with the original emoji licensing terms and consider the intended use case of your creations. We recommend reviewing the licensing agreements of the base emojis for commercial applications.',
    category: 'privacy'
  },
  {
    question: 'How can I share feedback or report issues?',
    answer: 'We love hearing from our users! You can share feedback, report bugs, or suggest new features through our contact channels. Your input helps us improve the app and add new features that make the emoji creation experience even better for everyone.',
    category: 'general'
  }
];

export const categories = [
  { key: 'all', label: 'All Questions', icon: '🔍' },
  { key: 'general', label: 'General', icon: '📝' },
  { key: 'usage', label: 'Usage', icon: '🛠️' },
  { key: 'technical', label: 'Technical', icon: '⚙️' },
  { key: 'sharing', label: 'Sharing', icon: '📤' },
  { key: 'privacy', label: 'Privacy', icon: '🔒' }
] as const;

export type CategoryType = typeof categories[number]['key'];