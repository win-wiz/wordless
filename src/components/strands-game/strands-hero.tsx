export default function StrandsHero() {
  return (
    <section className="w-full px-4 py-16 md:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-stone-500">
          Daily Puzzle + Unlimited Practice
        </p>
        <h1 className="mb-6 text-4xl font-black tracking-tight text-stone-800 md:text-6xl">
          Strands Game: A Word Search With a Twist
        </h1>
        <div className="mx-auto mb-8 h-1 w-20 rounded-full bg-amber-300" />
        <p className="max-w-3xl text-lg leading-relaxed text-stone-600 md:text-xl">
          Remember word searches? Strands takes the idea and makes it
          interesting. Every puzzle hides a handful of themed words in a 6×8
          letter grid — plus one <strong>spangram</strong>, the word that sums
          up the whole theme and stretches from edge to edge. Words bend at
          every letter, and every letter gets used exactly once, so each find
          makes the rest of the board easier to crack. There&apos;s a fresh
          daily puzzle every morning, and unlimited practice boards whenever
          you&apos;re on a roll. Free to play, right in your browser.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#game-section"
            className="rounded-full bg-stone-800 px-8 py-3 text-lg font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-stone-900"
          >
            Play Strands Now!
          </a>
          <a
            href="#how-to-play"
            className="rounded-full border-2 border-stone-300 bg-white px-8 py-3 text-lg font-semibold text-stone-700 transition-all hover:scale-105 hover:bg-stone-100"
          >
            Learn Strands Rules
          </a>
        </div>
      </div>
    </section>
  );
}
