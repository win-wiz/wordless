import React from 'react';

const FAQ_ITEMS = [
  {
    question: 'What is Waffle Game?',
    answer:
      'Waffle is a word puzzle where you solve 6 connected five-letter words on a cross-shaped 5x5 grid. The letters are already on the board, and you just need to swap them into the right spots.',
  },
  {
    question: 'How do you play Waffle?',
    answer:
      'Tap one letter, then tap another to swap them. After each move, the colors help you read the board: green means it is in the right spot, yellow means it belongs in that word but is in the wrong place, and gray means it still needs to move.',
  },
  {
    question: 'How many moves do you get in Waffle?',
    answer:
      'You get 15 swaps as the target. You can keep swapping if you need more, but the real challenge is solving all 6 words within those 15 moves.',
  },
  {
    question: 'What is the daily Waffle?',
    answer:
      'The daily Waffle gives you one puzzle per day. It is the one to play if you want a fresh challenge and a simple daily routine.',
  },
  {
    question: 'Is there an unlimited mode?',
    answer:
      'Yes. Unlimited mode lets you load a fresh puzzle anytime, so you can keep playing without waiting for the next daily board.',
  },
  {
    question: 'Can I play Waffle on mobile?',
    answer:
      'Yes. It works in your mobile browser, so you can play on your phone, tablet, or desktop without downloading anything.',
  },
  {
    question: 'What makes Waffle different from Wordle?',
    answer:
      'Wordle is about guessing one word. Waffle is about rearranging letters to solve 6 connected words at once, so it feels more like a mix of word logic and board strategy.',
  },
  {
    question: 'What should I do if I get stuck?',
    answer:
      'Start with the green letters and work around the intersections. Those shared tiles usually unlock the board faster than focusing on one word by itself.',
  },
] as const;

const QUICK_TIPS = [
  'Start with the green letters and leave them in place.',
  'Start with the intersections because one good swap can help two words at once.',
  'Use yellow letters to test likely word patterns before spending late moves.',
] as const;

const CONTAINER_STYLES = {
  mainContainer: 'py-20 px-6',
  maxWidthContainer: 'max-w-6xl mx-auto',
  intro:
    'mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-slate-600',
  faqGrid: 'grid gap-6 lg:grid-cols-2',
  faqCard:
    'rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm transition-colors hover:border-slate-300',
  question: 'mb-4 text-2xl font-bold text-slate-800',
  answer: 'text-base leading-7 text-slate-600',
  tipsSection: 'mt-16 border-t border-slate-300 pt-12',
  tipsTitle: 'mb-8 text-center text-2xl font-bold text-slate-800',
  tipsList: 'mx-auto grid max-w-4xl gap-4 md:grid-cols-3',
  tipCard:
    'rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6 text-base leading-7 text-slate-600',
} as const;

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const FAQ: React.FC = () => {
  const faqSchemaJson = JSON.stringify(FAQ_SCHEMA);

  return (
    <div className={CONTAINER_STYLES.mainContainer}>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: faqSchemaJson }}
      />
      <div className={CONTAINER_STYLES.maxWidthContainer}>
        <h2 className='mb-6 text-center text-4xl font-bold text-slate-800'>
          FAQ
        </h2>
        <p className={CONTAINER_STYLES.intro}>
          Quick answers to the questions people usually ask before they start
          playing Waffle for the first time.
        </p>

        <div className={CONTAINER_STYLES.faqGrid}>
          {FAQ_ITEMS.map((item) => (
            <article key={item.question} className={CONTAINER_STYLES.faqCard}>
              <h3 className={CONTAINER_STYLES.question}>{item.question}</h3>
              <p className={CONTAINER_STYLES.answer}>{item.answer}</p>
            </article>
          ))}
        </div>

        <div className={CONTAINER_STYLES.tipsSection}>
          <h3 className={CONTAINER_STYLES.tipsTitle}>Quick Tips for New Players</h3>
          <div className={CONTAINER_STYLES.tipsList}>
            {QUICK_TIPS.map((tip) => (
              <div key={tip} className={CONTAINER_STYLES.tipCard}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
