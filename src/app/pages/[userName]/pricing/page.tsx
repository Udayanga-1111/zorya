import { Check, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ userName: string }>;
}) {
  const { userName } = await params;
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="min-h-full py-12 px-6 relative overflow-hidden"
      style={{
        background: "radial-gradient(circle at 50% -20%, oklch(from var(--primary) l c h / 0.1) 0%, transparent 60%)"
      }}
    >
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-widest mb-2">
            <Star className="w-3 h-3" /> Elevate Your Journey
          </div>
          <h1 className="font-celestial text-4xl md:text-5xl font-semibold text-foreground">
            Unlock the Cosmos
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose the path that aligns with your wellness goals, {formattedName}. Discover deeper astrological insights and unlimited companion access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Tier */}
          <div className="relative p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/50 flex flex-col hover:border-primary/20 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-xl font-medium font-celestial text-foreground mb-2">Seeker</h3>
              <div className="flex items-baseline gap-1 text-foreground">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground text-sm">/ forever</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Essential tools for your daily wellness and astrological tracking.</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Daily horoscope readings",
                "Basic habit tracking (up to 3)",
                "Moon phase calendar",
                "Limited AI Companion chats (5/day)"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                  <Check className="w-5 h-5 text-primary/60 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full rounded-xl border-border/60 hover:bg-muted">
              Current Plan
            </Button>
          </div>

          {/* Premium Tier */}
          <div className="relative p-8 rounded-3xl bg-card/80 backdrop-blur-xl border border-primary/40 flex flex-col shadow-[0_8px_40px_-12px_oklch(from_var(--primary)_l_c_h_/_0.3)]">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recommended
              </span>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl pointer-events-none" />

            <div className="relative mb-6">
              <h3 className="text-xl font-medium font-celestial text-primary mb-2">Celestial</h3>
              <div className="flex items-baseline gap-1 text-foreground">
                <span className="text-4xl font-bold">$12</span>
                <span className="text-muted-foreground text-sm">/ month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Advanced insights, unlimited access, and personalized CBT guidance.</p>
            </div>
            <ul className="relative space-y-3 mb-8 flex-1">
              {[
                "Everything in Seeker",
                "Unlimited AI Companion access",
                "Full natal chart analysis",
                "Unlimited habit tracking & insights",
                "Personalized wellness routines based on transits",
                "Priority support"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="w-5 h-5 text-primary shrink-0 drop-shadow-sm" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="relative w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all">
              Upgrade to Celestial
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
