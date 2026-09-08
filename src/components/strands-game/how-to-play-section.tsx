export default function HowToPlaySection() {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-stone-200 bg-white/80 px-6 py-8 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-stone-800">How to play Strands</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
        <li>
          Find words hidden in the 6×8 letter grid. Words match the day&apos;s
          theme and can run in any direction — horizontal, vertical, or
          diagonal — and may change direction at every letter.
        </li>
        <li>
          Drag across neighboring letters (or tap them one by one) to spell a
          word. Tap the last letter again to submit, or tap the previous
          letter to step back.
        </li>
        <li>
          Theme words you find lock in blue. One special word — the{" "}
          <span className="font-semibold text-stone-800">spangram</span> —
          describes the whole theme and must stretch from one edge of the
          grid to the opposite edge. It locks in yellow.
        </li>
        <li>
          Every theme word plus the spangram uses each letter on the board
          exactly once, so the whole grid fills up when you win.
        </li>
        <li>
          Stuck? Spell any valid non-theme word of 4+ letters to charge the
          hint meter. Fill all three bars and press{" "}
          <span className="font-semibold text-stone-800">Hint</span> to reveal
          one hidden word&apos;s path.
        </li>
      </ul>
    </section>
  );
}
