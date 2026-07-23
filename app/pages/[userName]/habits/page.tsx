import { Calendar as CalendarIcon, CheckCircle2, Circle, Flame, Sparkles, TrendingUp } from "lucide-react";

export default async function HabitsPage({
  params,
}: {
  params: Promise<{ userName: string }>;
}) {
  const { userName } = await params;
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const habits = [
    { name: "Morning Meditation", streak: 12, completed: true, icon: Sparkles, color: "text-purple-400", bg: "bg-purple-400/10" },
    { name: "Journaling", streak: 5, completed: false, icon: CalendarIcon, color: "text-blue-400", bg: "bg-blue-400/10" },
    { name: "Mindful Walking", streak: 8, completed: true, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="min-h-full p-8 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 80% 0%, oklch(from var(--primary) l c h / 0.05) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.04) 0%, transparent 50%)"
      }}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-celestial text-4xl font-semibold text-foreground mb-2 flex items-center gap-3">
              Daily Rituals <Sparkles className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground">
              Align your habits with the lunar cycles, {formattedName}.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Phase</span>
              <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-lg">🌔</span> Waxing Gibbous</span>
            </div>
            <div className="w-px h-8 bg-border/60 mx-2" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Energy</span>
              <span className="text-sm font-medium text-primary">Building, Focusing</span>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Perfect Days", value: "4", subtitle: "This week" },
            { label: "Longest Streak", value: "21", subtitle: "Days" },
            { label: "Completion Rate", value: "85%", subtitle: "Last 30 days" }
          ].map((stat, i) => (
            <div key={i} className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-5 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flame className="w-12 h-12 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-celestial font-semibold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground/80">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium font-celestial flex items-center gap-2">
            Today's Path
          </h2>
          <div className="grid gap-3">
            {habits.map((habit, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-card/50 backdrop-blur-md border border-border/50 hover:bg-card/80 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:border-primary/20">
                <div className="flex items-center gap-4">
                  <button className="text-muted-foreground hover:text-primary transition-colors focus:outline-none">
                    {habit.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground/40 group-hover:text-primary/50" />
                    )}
                  </button>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${habit.bg}`}>
                      <habit.icon className={`w-5 h-5 ${habit.color}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${habit.completed ? 'text-muted-foreground line-through decoration-primary/30' : 'text-foreground'}`}>
                        {habit.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" /> {habit.streak} day streak
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  {/* Miniature weekly visualization */}
                  {[1,1,0,1,1,1, habit.completed?1:0].map((day, j) => (
                    <div key={j} className={`w-2 h-8 rounded-full ${day ? 'bg-primary/60' : 'bg-muted'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
