export function ZoryaNote() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-primary/25 mb-8 celestial-glow">
      {/* Gradient wash behind card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, oklch(from var(--primary) l c h / 0.07) 0%, transparent 60%)",
        }}
      />
      <div className="relative p-6 flex items-start gap-5">
        {/* Ornate heart orb */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-inner mt-0.5">
          <HeartIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary mb-2">
            ✦ &nbsp; A Note from Zorya
          </p>
          <p className="font-celestial text-[17px] italic text-foreground/80 leading-relaxed">
            &ldquo;Mercury&rsquo;s gentle sextile with your Venus today brings emotional clarity — a good
            day for the conversations you&rsquo;ve been postponing. Saturn&rsquo;s steady support gives
            you the groundedness to handle them with care.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
