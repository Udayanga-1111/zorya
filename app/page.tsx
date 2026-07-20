import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CalendarDays, MessageSquareHeart, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between z-50">
        <div className="text-2xl font-bold tracking-tight text-primary">Zorya</div>
        <div className="flex items-center gap-4">
          <Link href="/pages/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Log In</Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>
  
      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            Science-backed wellness
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Align with your natural cycles.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
            Zorya provides personalized CBT planning that adapts to your natural rhythm. Build habits, manage stress, and track your well-being with your intelligent companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/pages/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full rounded-full">Get Started</Button>
            </Link>
            <Link href="/pages/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full rounded-full">Log In</Button>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full px-6 py-20 bg-muted/30 border-y border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Create your profile</h3>
                <p className="text-muted-foreground">Share your baseline details to generate a highly personalized wellness chart.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Get your daily plan</h3>
                <p className="text-muted-foreground">Receive adaptive CBT techniques tailored to where you are in your cycle.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Build habits</h3>
                <p className="text-muted-foreground">Check in with your AI companion to stay on track and cultivate resilience.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full px-6 py-24 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Designed for real well-being</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background/60 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CalendarDays className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Adaptive CBT Calendar</CardTitle>
                <CardDescription>Dynamic planning that shifts based on your natural energy and stress patterns.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <MessageSquareHeart className="w-10 h-10 text-primary mb-4" />
                <CardTitle>AI Companion</CardTitle>
                <CardDescription>A supportive chat interface to help you process thoughts and apply CBT techniques.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <Sparkles className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Habit Tracking</CardTitle>
                <CardDescription>Gentle, forgiving tracking that encourages consistency without the guilt.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border py-8 px-6 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto">
        <div className="mb-4 md:mb-0">
          © {new Date().getFullYear()} Zorya Wellness. All rights reserved.
        </div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-foreground transition-colors">About</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
