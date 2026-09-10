import StrandsExamples from "./strands-examples";

const STEPS = [
  <>
    Find words hidden in the 6×8 letter grid. Words match the day&apos;s theme
    and can run in any direction — horizontal, vertical, or diagonal — and may
    change direction at every letter.
  </>,
  <>
    Drag across neighboring letters (or tap them one by one) to spell a word.
    Tap the last letter again to submit, or tap the previous letter to step
    back.
  </>,
  <>
    Theme words you find lock in blue. One special word — the{" "}
    <span className="font-semibold text-stone-800">spangram</span> — describes
    the whole theme and must stretch from one edge of the grid to the opposite
    edge. It locks in yellow.
  </>,
  <>
    Every theme word plus the spangram uses each letter on the board exactly
    once, so the whole grid fills up when you win.
  </>,
  <>
    Stuck? Spell any valid non-theme word of 4+ letters to charge the hint
    meter. Fill all three bars and press{" "}
    <span className="font-semibold text-stone-800">Hint</span> to reveal one
    hidden word&apos;s path.
  </>,
];

export default function HowToPlaySection() {
  return (
    <section
      id="how-to-play"
      className="w-full scroll-mt-24 px-4 pb-16"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-stone-800">
            How to Play Strands
          </h2>
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-amber-300" />
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
            See a board in action, then five things to know before your first
            game — you&apos;ll be tracing words in under a minute.
          </p>
        </div>

        <StrandsExamples />

        <ol className="flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-4 rounded-3xl border border-stone-200 bg-white/80 px-6 py-5 shadow-sm"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                {index + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-stone-600">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
