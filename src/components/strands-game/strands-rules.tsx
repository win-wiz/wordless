import type { ReactNode } from "react";

type RuleItemProps = {
  icon: string;
  title: string;
  description: ReactNode;
};

function RuleItem({ icon, title, description }: RuleItemProps) {
  return (
    <div className="group flex items-start gap-6">
      <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-amber-100">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex-1 pt-2">
        <h3 className="mb-2 text-xl font-semibold text-stone-800 transition-colors group-hover:text-amber-700">
          {title}
        </h3>
        <div className="text-stone-600">{description}</div>
      </div>
    </div>
  );
}

function ColorClues() {
  return (
    <div className="space-y-2 text-stone-600">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#A6C8FF" }} />
        <span>Blue means a theme word is locked in</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#F9DF6D" }} />
        <span>Yellow is the spangram — the big one that spans the board</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-amber-400" />
        <span>Amber bars fill up as you find bonus words — three earn a hint</span>
      </div>
    </div>
  );
}

function ProTips() {
  return (
    <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-stone-600">
      <li>Read the theme twice — every answer lives inside it</li>
      <li>Check the edges early: the spangram has to touch two opposite sides</li>
      <li>Every word you find removes letters, so the board keeps getting easier</li>
      <li>Random 4+ letter words aren&apos;t wasted — they charge your hint meter</li>
      <li>One daily puzzle too few? Practice mode has unlimited boards</li>
    </ul>
  );
}

export default function StrandsRules() {
  return (
    <section className="w-full px-4 pb-16">
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <RuleItem
          icon="🎯"
          title="Find words that fit the theme"
          description="Every answer relates to the day's theme. Drag through neighboring letters in any direction — words can turn at every letter, so think zigzag, not straight lines."
        />
        <RuleItem
          icon="⚡"
          title="Fill the whole board to win"
          description="Every theme word plus the spangram uses each letter on the 6×8 grid exactly once. When the board is completely filled, you've solved the puzzle."
        />
        <RuleItem
          icon="🎨"
          title="What the colors mean"
          description={<ColorClues />}
        />
        <RuleItem
          icon="💡"
          title="Strands tips from regular players"
          description={<ProTips />}
        />
      </div>
    </section>
  );
}
