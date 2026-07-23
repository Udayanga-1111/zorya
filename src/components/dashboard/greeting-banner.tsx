export function GreetingBanner({ userName }: { userName: string }) {
  // Hardcoded for the demo, in a real app this would be dynamic
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
  
  return (
    <div className="mb-10 flex items-end justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/70 mb-1">
          ☾ &nbsp; Thursday, 17 July · New Moon Phase
        </p>
        <h1 className="font-celestial text-5xl font-light italic text-foreground leading-tight">
          Good morning, {formattedName}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
          4 planetary influences are shaping your day.&nbsp;
          <span className="text-foreground/80">Here&rsquo;s what we&rsquo;ve prepared.</span>
        </p>
      </div>

      {/* Moon phase ornament */}
      <div className="hidden md:flex flex-col items-center gap-1 opacity-60">
        <span className="text-5xl leading-none text-primary">🌙</span>
        <span className="text-[9px] tracking-widest uppercase text-muted-foreground">New Moon</span>
      </div>
    </div>
  );
}
