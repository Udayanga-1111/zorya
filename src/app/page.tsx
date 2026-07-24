"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CalendarDays, MessageSquareHeart, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroScene } from "@/components/3d/hero-scene";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero Text Parallax & Fade
    if (heroTextRef.current && containerRef.current) {
      gsap.to(heroTextRef.current, {
        y: 150,
        opacity: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      });
    }

    // How it works steps staggered animation
    if (stepsRef.current) {
      const steps = stepsRef.current.children;
      gsap.fromTo(steps, 
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 80%",
          }
        }
      );
    }

    // Features staggered animation
    if (featuresRef.current) {
      const features = featuresRef.current.children;
      gsap.fromTo(features, 
        { scale: 0.95, opacity: 0, y: 40 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 85%",
          }
        }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen">
      {/* 3D Background - Permanently fixed behind content */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HeroScene />
      </div>

      {/* Navigation - Glassmorphism floating */}
      <header className="fixed top-0 w-full px-6 py-4 flex items-center justify-between z-50 glass-nav">
        <div className="text-2xl font-bold tracking-tight text-primary font-heading">Zorya</div>
        <div className="flex items-center gap-4">
          <Link href="/pages/login">
            <Button variant="ghost" className="hidden sm:inline-flex btn-magnetic">Log In</Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>
  
      <main className="flex-1 flex flex-col items-center relative z-10 pt-20">
        {/* Hero Section */}
        <section className="w-full h-[90vh] px-6 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <div ref={heroTextRef} className="flex flex-col items-center pointer-events-none">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-background/20 backdrop-blur-md border border-primary/30 text-primary celestial-glow">
              <Sparkles className="w-4 h-4 mr-2" />
              Cosmic-backed wellness
            </div>
            <h1 className="text-6xl md:text-8xl font-heading font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-primary/50 drop-shadow-lg">
              Align with your natural cycles.
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-2xl font-celestial">
              Zorya provides personalized CBT planning that adapts to your natural rhythm. Build habits, manage stress, and track your well-being with your intelligent celestial companion.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto pointer-events-auto">
              <Link href="/pages/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full btn-magnetic btn-glow h-14 px-8 text-lg">Get Started</Button>
              </Link>
              <Link href="/pages/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full glass-card h-14 px-8 text-lg border-primary/50 hover:bg-primary/20 transition-colors">Log In</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full px-6 py-32 bg-background/30 backdrop-blur-sm border-y border-border/20 relative">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16 celestial-glow text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-foreground">How it works</h2>
            <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center glass-card p-8 rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-heading font-bold text-2xl mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">1</div>
                <h3 className="text-2xl font-semibold mb-4 font-heading">Create your profile</h3>
                <p className="text-muted-foreground font-sans">Share your baseline details to generate a highly personalized celestial wellness chart.</p>
              </div>
              <div className="flex flex-col items-center text-center glass-card p-8 rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-heading font-bold text-2xl mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">2</div>
                <h3 className="text-2xl font-semibold mb-4 font-heading">Get your daily plan</h3>
                <p className="text-muted-foreground font-sans">Receive adaptive CBT techniques tailored to where you are in your cosmic cycle.</p>
              </div>
              <div className="flex flex-col items-center text-center glass-card p-8 rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-heading font-bold text-2xl mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">3</div>
                <h3 className="text-2xl font-semibold mb-4 font-heading">Build habits</h3>
                <p className="text-muted-foreground font-sans">Check in with your AI companion to stay on track and cultivate resilience.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full px-6 py-32 max-w-6xl mx-auto relative">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-20">Designed for real well-being</h2>
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card hover:-translate-y-2 transition-transform duration-500 border-primary/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <CalendarDays className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-heading text-2xl">Adaptive CBT Calendar</CardTitle>
                <CardDescription className="text-base mt-2">Dynamic planning that shifts based on your natural energy and stress patterns.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass-card hover:-translate-y-2 transition-transform duration-500 border-primary/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <MessageSquareHeart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-heading text-2xl">AI Companion</CardTitle>
                <CardDescription className="text-base mt-2">A supportive chat interface to help you process thoughts and apply CBT techniques.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass-card hover:-translate-y-2 transition-transform duration-500 border-primary/20">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-heading text-2xl">Habit Tracking</CardTitle>
                <CardDescription className="text-base mt-2">Gentle, forgiving tracking that encourages consistency without the guilt.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full glass-nav border-t-white/10 py-8 px-6 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center z-10 relative mt-auto">
        <div className="mb-4 md:mb-0">
          © {new Date().getFullYear()} Zorya Wellness. All rights reserved.
        </div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-primary transition-colors">About</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
