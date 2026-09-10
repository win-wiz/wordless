const FAQ_ITEMS = [
  {
    question: "What is Strands Game?",
    answer:
      "It's a word search with a brain. You get a 6×8 grid of letters and a theme, and every word hiding in the grid relates to that theme. The star of the show is the spangram — one word that captures the whole theme and runs from one edge of the board to the other.",
  },
  {
    question: "How do you play Strands?",
    answer:
      "Drag through neighboring letters (or tap them one by one) to spell a word. Words can go in any direction and turn at every letter, so they zigzag all over the grid. Tap the last letter again to submit. Find every theme word plus the spangram, and the board fills up completely — that's a win.",
  },
  {
    question: "What is a spangram?",
    answer:
      "The spangram is the one word that sums up the entire puzzle. It has to touch two opposite edges of the grid — top to bottom or side to side — and it turns yellow when you find it. Regular theme words turn blue. When you're stuck, hunting the spangram first often unlocks the whole board.",
  },
  {
    question: "Is Strands Game free to play?",
    answer:
      "Completely free, and there's nothing to download or install. Open the page in any browser — phone, tablet, or computer — and you're playing. The daily puzzle is free, practice mode is free, everything.",
  },
  {
    question: "How do hints work in Strands?",
    answer:
      "Here's the deal: any real word of 4+ letters that isn't part of the theme still counts for something — it charges your hint meter. Three bonus words fill all three bars and earn you a hint, which lights up the letters of one hidden word without telling you what it spells.",
  },
  {
    question: "Can I play Strands unlimited?",
    answer:
      "Yes — that's what practice mode is for. The daily puzzle gives you one new board each day (the same one everyone else gets), and practice mode serves up unlimited random boards whenever you want another round.",
  },
  {
    question: "Can I replay past Strands puzzles?",
    answer:
      "Yep. The Strands archive keeps previous daily puzzles, so you can replay any day you missed or open that puzzle's hints & answers article if you'd rather see how it was meant to be solved.",
  },
  {
    question: "How is Strands different from a regular word search?",
    answer:
      "A classic word search hands you the word list and every word runs in a straight line. Strands only gives you a theme — you figure out which words exist. Words bend at every letter, and every letter on the board is used exactly once, so each find genuinely shrinks the puzzle.",
  },
] as const;

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function StrandsFAQ() {
  return (
    <section className="w-full px-4 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-stone-800">
            Strands Game - Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-amber-300" />
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
            Everything people usually ask before their first board — spangrams,
            hints, daily mode, and where to find old puzzles.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {FAQ_ITEMS.map((item) => (
            <article
              key={item.question}
              className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm transition-colors hover:border-stone-300"
            >
              <div className="mb-3 flex items-center">
                <span className="mr-4 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700">
                  Q
                </span>
                <h3 className="text-lg font-semibold text-stone-800">
                  {item.question}
                </h3>
              </div>
              <p className="ml-12 text-sm leading-relaxed text-stone-600">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
