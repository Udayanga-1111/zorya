import { Bot, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AICompanionPage({
  params,
}: {
  params: Promise<{ userName: string }>;
}) {
  const { userName } = await params;
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="h-full flex flex-col relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 80% 0%, oklch(from var(--primary) l c h / 0.05) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.04) 0%, transparent 50%)"
      }}
    >
      {/* Header */}
      <div className="flex-none p-6 border-b border-border/40 bg-background/50 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-celestial text-2xl font-semibold text-foreground">Aura</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500/80 animate-pulse" /> Online and ready to listen
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          
          {/* AI Message */}
          <div className="flex gap-4 items-start max-w-[85%]">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl rounded-tl-sm p-4 text-sm text-foreground shadow-sm">
              <p>Hello {formattedName}! I'm Aura, your astrological and wellness companion. I can help you reflect on your day, explore your birth chart, or practice mindful CBT techniques. What's on your mind today?</p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex gap-4 items-start flex-row-reverse max-w-[85%] ml-auto">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-1">
              <User className="w-4 h-4" />
            </div>
            <div className="bg-primary/90 backdrop-blur-md text-primary-foreground rounded-2xl rounded-tr-sm p-4 text-sm shadow-md">
              <p>I've been feeling a bit overwhelmed with work lately. Any advice based on my current transits?</p>
            </div>
          </div>

          {/* AI Message (Typing indicator) */}
          <div className="flex gap-4 items-start max-w-[85%] animate-pulse">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
               <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
               <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
               <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>

        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 relative z-10">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <div className="absolute left-4 z-20">
            <Sparkles className="w-5 h-5 text-primary/50" />
          </div>
          <Input 
            placeholder="Share your thoughts or ask the cosmos..." 
            className="pl-12 pr-12 h-14 rounded-2xl bg-card/50 border-border/60 focus-visible:ring-primary/30 text-base"
          />
          <Button size="icon" className="absolute right-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-md">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-3">Aura is an AI companion and may occasionally make mistakes. Please verify important astrological insights.</p>
      </div>
    </div>
  );
}
