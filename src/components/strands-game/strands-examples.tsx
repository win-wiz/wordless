import { getSmoothPath, pointKey } from "@/lib/strands-engine";
import { cn } from "@/lib/utils";
import type { StrandsPoint } from "@/types/strands";

type PathState = "theme" | "spangram" | "hint";

type Demo = {
  key: string;
  title: string;
  caption: string;
  letters: string[][];
  path: { points: StrandsPoint[]; state: PathState };
};

const PATH_COLORS: Record<PathState, string> = {
  theme: "#93c5fd",
  spangram: "#facc15",
  hint: "#fbbf24",
};

const DEMOS: Demo[] = [
  {
    key: "theme-word",
    title: "Snake out theme words",
    caption: "Words bend in any direction and turn at any letter. Found words lock in blue.",
    letters: [
      ["S", "P", "L", "M"],
      ["T", "E", "O", "N"],
      ["K", "A", "R", "D"],
      ["G", "U", "I", "P"],
    ],
    path: {
      points: [
        { r: 0, c: 1 },
        { r: 1, c: 1 },
        { r: 2, c: 1 },
        { r: 2, c: 2 },
      ],
      state: "theme",
    },
  },
  {
    key: "spangram",
    title: "Span the whole board",
    caption: "The spangram describes the theme and stretches from one edge to the opposite edge. It locks in yellow.",
    letters: [
      ["M", "T", "S", "L"],
      ["E", "A", "K", "P"],
      ["W", "I", "N", "G"],
      ["B", "U", "Y", "O"],
    ],
    path: {
      points: [
        { r: 0, c: 0 },
        { r: 1, c: 1 },
        { r: 2, c: 2 },
        { r: 2, c: 3 },
        { r: 3, c: 3 },
      ],
      state: "spangram",
    },
  },
  {
    key: "hint",
    title: "Stuck? Take a hint",
    caption: "Spell three 4+ letter words to fill the meter — a hint lights up a hidden word's path.",
    letters: [
      ["A", "S", "T", "E"],
      ["L", "I", "U", "P"],
      ["M", "N", "R", "O"],
      ["D", "G", "K", "S"],
    ],
    path: {
      points: [
        { r: 0, c: 2 },
        { r: 1, c: 2 },
        { r: 2, c: 2 },
        { r: 2, c: 1 },
      ],
      state: "hint",
    },
  },
];

function DemoBoard({ demo }: { demo: Demo }) {
  const rows = demo.letters.length;
  const cols = demo.letters[0]?.length ?? 0;
  const pathSet = new Set(demo.path.points.map(pointKey));

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[170px]"
      style={{ aspectRatio: `${cols} / ${rows}` }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${cols * 100} ${rows * 100}`}
        preserveAspectRatio="none"
      >
        <path
          d={getSmoothPath(demo.path.points)}
          fill="none"
          stroke={PATH_COLORS[demo.path.state]}
          strokeWidth={20}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.6}
          style={{ mixBlendMode: "multiply" }}
        />
      </svg>

      <div
        className="absolute inset-0 grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {demo.letters.map((row, r) =>
          row.map((letter, c) => {
            const isPath = pathSet.has(pointKey({ r, c }));
            const state = isPath ? demo.path.state : null;

            return (
              <div
                key={`${r},${c}`}
                className={cn(
                  "flex items-center justify-center rounded-full border text-sm font-bold uppercase",
                  state === "spangram"
                    ? "border-yellow-400 bg-yellow-300 text-yellow-900"
                    : state === "theme"
                      ? "border-blue-300 bg-blue-200 text-blue-900"
                      : state === "hint"
                        ? "border-stone-200 bg-white text-stone-800 shadow-sm ring-2 ring-amber-400/60"
                        : "border-stone-200 bg-white text-stone-800 shadow-sm",
                )}
              >
                {letter}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export default function StrandsExamples() {
  return (
    <div className="mb-10 grid gap-4 sm:grid-cols-3">
      {DEMOS.map((demo) => (
        <figure
          key={demo.key}
          className="flex flex-col items-center gap-4 rounded-3xl border border-stone-200 bg-white/80 px-4 py-6 shadow-sm"
        >
          <DemoBoard demo={demo} />
          <figcaption className="text-center">
            <p className="text-sm font-semibold text-stone-800">{demo.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              {demo.caption}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
