"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  RefreshCw,
  Clock,
  Brain,
  Wind,
  Heart,
  Layers,
} from "lucide-react";
import { useStream } from "@/components/providers/stream-provider";

// ─── Category configuration ──────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  Focus:         { icon: Brain,    color: "text-primary",     bg: "bg-primary/10",     dot: "bg-primary",      border: "border-primary/20",    label: "Cognitive",    emoji: "🧠" },
  Rest:          { icon: Wind,     color: "text-blue-500",    bg: "bg-blue-500/10",    dot: "bg-blue-500",     border: "border-blue-500/20",   label: "Recovery",     emoji: "🌙" },
  Communication: { icon: Heart,    color: "text-emerald-500", bg: "bg-emerald-500/10", dot: "bg-emerald-500",  border: "border-emerald-500/20",label: "Interpersonal",emoji: "💬" },
  Grounding:     { icon: Layers,   color: "text-teal-500",    bg: "bg-teal-500/10",    dot: "bg-teal-500",     border: "border-teal-500/20",   label: "Somatic",      emoji: "🌿" },
  Reflection:    { icon: Sparkles, color: "text-orange-500",  bg: "bg-orange-500/10",  dot: "bg-orange-500",   border: "border-orange-500/20", label: "Reflective",   emoji: "✨" },
};

const TIME_SLOTS = ["8:00 AM", "10:00 AM", "12:30 PM", "3:00 PM", "6:00 PM", "8:00 PM"];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── Skeleton loaders ────────────────────────────────────────────────────────
function BlockSkeleton() {
  return (
    <div className="flex gap-3 sm:gap-5 animate-pulse">
      <div className="w-14 sm:w-20 shrink-0 flex flex-col items-end gap-1 mt-1">
        <div className="h-3 w-12 rounded bg-muted" />
        <div className="h-2.5 w-8 rounded bg-muted" />
      </div>
      <div className="flex flex-col items-center gap-0 shrink-0">
        <div className="h-5 w-5 rounded-full bg-muted" />
        <div className="w-px flex-1 bg-muted mt-1" style={{ minHeight: 48 }} />
      </div>
      <div className="flex-1 pb-8 space-y-2 mt-0.5">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Mini Week Pill ───────────────────────────────────────────────────────────
function WeekDayPicker({ selectedDay, setSelectedDay, today }) {
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - d.getDay() + i);
      days.push(d);
    }
    return days;
  }, [today]);

  return (
    <div className="flex gap-1 sm:gap-2 bg-card/60 border border-border/60 rounded-2xl p-1.5 backdrop-blur-sm overflow-x-auto scrollbar-hide">
      {weekDays.map((day, i) => {
        const isToday = day.toDateString() === today.toDateString();
        const isSelected = day.toDateString() === selectedDay.toDateString();
        return (
          <button
            key={i}
            onClick={() => setSelectedDay(day)}
            className={`flex flex-col items-center gap-0.5 px-2.5 sm:px-3.5 py-2 rounded-xl transition-all duration-200 shrink-0 min-w-[40px] sm:min-w-fit
              ${isSelected
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : isToday
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide">{DAYS_SHORT[day.getDay()]}</span>
            <span className={`text-base sm:text-lg font-semibold font-celestial leading-none ${isSelected ? "text-primary-foreground" : ""}`}>
              {day.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Habit Block Card ─────────────────────────────────────────────────────────
function HabitBlockCard({ block, timeSlot, index, total, isChecked, onToggle }) {
  const cfg = CATEGORY_CONFIG[block.category] ?? CATEGORY_CONFIG.Focus;
  const Icon = cfg.icon;
  const isLast = index === total - 1;

  return (
    <div className={`flex gap-3 sm:gap-5 group ${!isLast ? "pb-6 sm:pb-8" : ""}`}>
      {/* Time column */}
      <div className="w-14 sm:w-20 shrink-0 text-right mt-1">
        <div className="font-sans text-input-text text-primary-custom/70">{timeSlot}</div>
        <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5 mt-0.5">
          <Clock className="w-2.5 h-2.5" />
          <span>{block.duration_minutes}m</span>
        </div>
      </div>

      {/* Timeline connector */}
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={() => onToggle(index)}
          className="relative z-10 mt-0.5 transition-all duration-200 focus:outline-none"
          aria-label={isChecked ? "Mark incomplete" : "Mark complete"}
        >
          {isChecked ? (
            <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-[0_0_6px_rgba(var(--primary),0.4)]" />
          ) : (
            <Circle className={`w-5 h-5 ${cfg.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
          )}
        </button>
        {!isLast && (
          <div
            className="w-px flex-1 mt-1.5"
            style={{ background: "linear-gradient(to bottom, oklch(from var(--primary) l c h / 0.25), transparent)" }}
          />
        )}
      </div>

      {/* Content card */}
      <div className={`flex-1 pb-1 transition-opacity duration-200 ${isChecked ? "opacity-50" : "opacity-100"}`}>
        <div
          className={`rounded-2xl border ${cfg.border} bg-card/70 backdrop-blur-sm p-3 sm:p-4 relative overflow-hidden group-hover:border-primary/25 transition-all duration-300`}
          style={{ boxShadow: isChecked ? "none" : `0 2px 16px -4px ${cfg.color.replace("text-", "color:")}` }}
        >
          {/* Category accent top line */}
          <div className={`absolute top-0 left-4 right-4 h-px ${cfg.dot} opacity-30`} />

          <div className="flex items-start gap-3">
            {/* Icon badge */}
            <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${cfg.bg}`}>
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${cfg.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className={`font-sans text-card-title ${isChecked ? "line-through text-muted-foreground" : "text-primary-custom"}`}>
                  {block.title}
                </h4>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted/70 text-muted-foreground border border-border/60">
                  {cfg.label}
                </span>
              </div>
              <p className="font-sans text-body-custom text-secondary-custom leading-relaxed">
                {block.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ blocks, checkedSet }) {
  const totalMins = blocks.reduce((a, b) => a + (b.duration_minutes ?? 0), 0);
  const completed = checkedSet.size;
  const pct = blocks.length > 0 ? Math.round((completed / blocks.length) * 100) : 0;

  const stats = [
    { label: "Completed", value: `${completed}/${blocks.length}`, sub: "habits done" },
    { label: "Focus time", value: `${totalMins}m`, sub: "total today" },
    { label: "Progress", value: `${pct}%`, sub: "of daily plan" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
      {stats.map((s, i) => (
        <div key={i} className="bg-card/50 border border-border/50 rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden group hover:border-primary/25 transition-all duration-200">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "radial-gradient(circle at 50% 0%, oklch(from var(--primary) l c h / 0.04), transparent 70%)" }}
          />
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{s.label}</p>
          <p className="font-celestial text-xl sm:text-2xl font-semibold text-foreground">{s.value}</p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/70">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Empty / Onboarding State ─────────────────────────────────────────────────
function EmptyState({ isOnboarded }) {
  if (!isOnboarded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
          <CalendarIcon className="w-9 h-9 text-primary/50" />
        </div>
        <h3 className="font-celestial text-2xl sm:text-3xl font-light italic text-foreground mb-3">
          Your Schedule Awaits
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-8">
          Complete your natal setup to unlock a personalized CBT habit schedule aligned with your active planetary dashas.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 h-11 px-7 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4" /> Complete Setup
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
        <span className="text-2xl animate-pulse opacity-60">☽</span>
      </div>
      <p className="text-muted-foreground text-sm">Loading your celestial habit schedule…</p>
    </div>
  );
}

// ─── Main Calendar Page ───────────────────────────────────────────────────────
export default function CalendarPage() {
  const { clinicalPlan, celestialContext, isStreaming, streamError, runStream, isOnboarded } = useStream();

  const today = useMemo(() => new Date(), []);
  const [selectedDay, setSelectedDay] = useState(today);
  const [checkedMap, setCheckedMap] = useState({}); // { "YYYY-MM-DD": Set<index> }

  const dateKey = selectedDay.toISOString().split("T")[0];
  const todayKey = today.toISOString().split("T")[0];

  // Blocks — only live for today (AI-generated), placeholder for other days
  const blocks = useMemo(() => {
    if (dateKey === todayKey && clinicalPlan?.blocks?.length) {
      return clinicalPlan.blocks;
    }
    return [];
  }, [dateKey, todayKey, clinicalPlan]);

  const isToday = dateKey === todayKey;

  const checkedSet = useMemo(() => checkedMap[dateKey] ?? new Set(), [checkedMap, dateKey]);

  const handleToggle = (index) => {
    setCheckedMap((prev) => {
      const existing = prev[dateKey] ? new Set(prev[dateKey]) : new Set();
      if (existing.has(index)) {
        existing.delete(index);
      } else {
        existing.add(index);
      }
      return { ...prev, [dateKey]: existing };
    });
  };

  const isLoading = isStreaming && !clinicalPlan;

  return (
    <div
      className="min-h-full px-4 sm:px-8 py-6 sm:py-10 relative"
      style={{
        background:
          "radial-gradient(ellipse at 60% 0%, oklch(from var(--primary) l c h / 0.05) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.04) 0%, transparent 50%)",
      }}
    >
      {/* Ambient stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute top-6 right-12 text-primary/15 text-xs animate-twinkle">✦</span>
        <span className="absolute top-32 right-40 text-primary/10 text-[10px] animate-twinkle-delay">✧</span>
        <span className="absolute top-16 left-1/3 text-primary/10 text-[8px] animate-twinkle">✦</span>
      </div>

      <div className="relative mx-auto max-w-3xl">

        {/* ── Page header ── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-serif text-page-title text-primary-custom flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              Habit Schedule
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {MONTHS[today.getMonth()]} {today.getFullYear()} · CBT blocks aligned to your chart
            </p>
          </div>

          {/* Active Dasha pill */}
          {celestialContext?.active_dasha && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary shrink-0 self-start sm:self-auto">
              <span className="text-sm">♃</span>
              <span className="font-medium">{celestialContext.active_dasha}</span>
            </div>
          )}
        </div>

        {/* ── Week day picker ── */}
        <div className="mb-6">
          <WeekDayPicker selectedDay={selectedDay} setSelectedDay={setSelectedDay} today={today} />
        </div>

        {/* ── Selected day label ── */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-celestial text-lg sm:text-xl font-medium text-foreground">
              {isToday ? "Today, " : ""}
              {DAYS_SHORT[selectedDay.getDay()]}, {MONTHS[selectedDay.getMonth()].slice(0,3)} {selectedDay.getDate()}
            </h2>
            {isToday && isStreaming && (
              <span className="flex items-center gap-1.5 text-[10px] text-primary/70 bg-primary/5 border border-primary/15 rounded-full px-2.5 py-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {/* Error + retry */}
          {streamError && isToday && (
            <button
              onClick={runStream}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          )}
        </div>

        {/* ── Stats row (only when blocks are available) ── */}
        {!isLoading && blocks.length > 0 && (
          <StatsRow blocks={blocks} checkedSet={checkedSet} />
        )}

        {/* ── Habit block timeline ── */}
        <div className="relative rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-4 sm:p-7 overflow-hidden">
          {/* Top ambient glow */}
          <div
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, oklch(from var(--primary) l c h / 0.07) 0%, transparent 70%)" }}
          />

          {isLoading ? (
            <div className="relative space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <BlockSkeleton key={i} />
              ))}
            </div>
          ) : !isOnboarded || (!isToday && blocks.length === 0) ? (
            <EmptyState isOnboarded={isOnboarded} />
          ) : blocks.length === 0 && isToday ? (
            // Today but no blocks yet — could be error or non-onboarded
            <EmptyState isOnboarded={isOnboarded} />
          ) : (
            <div className="relative space-y-0">
              {blocks.map((block, i) => (
                <HabitBlockCard
                  key={`${block.category}-${i}`}
                  block={block}
                  timeSlot={TIME_SLOTS[i] ?? "--:--"}
                  index={i}
                  total={blocks.length}
                  isChecked={checkedSet.has(i)}
                  onToggle={handleToggle}
                />
              ))}

              {/* Ethical disclaimer */}
              {blocks[0]?.disclaimer && (
                <p className="mt-6 text-[10px] text-muted-foreground/50 leading-relaxed border-t border-border/40 pt-4">
                  ⚕ {blocks[0].disclaimer}
                </p>
              )}
            </div>
          )}

          {/* Other days placeholder message */}
          {!isLoading && !isToday && (
            <div className="mt-4 text-center text-xs text-muted-foreground/60 italic">
              AI-generated habit plans are created fresh each day. Navigate to today to see your live schedule.
            </div>
          )}
        </div>

        {/* ── CBT Category legend ── */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
            <div key={cat} className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-card/50 border border-border/40 rounded-full px-2.5 py-1">
              <span className="text-xs">{cfg.emoji}</span>
              <span>{cat}</span>
            </div>
          ))}
        </div>

        {/* Bottom flourish */}
        <div className="mt-8 text-center text-muted-foreground/30 tracking-[0.3em] text-xs select-none">
          ✦ &nbsp;&nbsp; ✧ &nbsp;&nbsp; ✦
        </div>
      </div>
    </div>
  );
}
