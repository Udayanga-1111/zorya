"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  is_approximate_time: z.boolean().default(false),
  birth_city: z.string().min(2, "City is required"),
  latitude: z.number(),
  longitude: z.number(),
  pdpa_consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing to continue",
  }),
  primaryGoal: z.string().min(1, "Please select a primary goal"),
  focusAreas: z.array(z.string()).default([]),
  userNotes: z.string().optional(),
});

const GOAL_OPTIONS = [
  "🧠 Deep Focus & Productivity",
  "🧘 Manage Stress & Overwhelm",
  "🌙 Sleep Quality & Evening Rest",
  "💬 Clear Communication & Boundaries",
  "🌿 Emotional Balance & Mindfulness",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [citySearch, setCitySearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      birth_date: "",
      birth_time: "",
      is_approximate_time: false,
      birth_city: "",
      latitude: undefined,
      longitude: undefined,
      pdpa_consent: false,
      primaryGoal: "",
      focusAreas: [],
      userNotes: "",
    },
  });

  const formValues = watch();

  // Search Nominatim API
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (citySearch.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              citySearch
            )}&limit=5`
          );
          const data = await res.json();
          setSearchResults(data);
        } catch (e) {
          console.error("Geocoding error", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [citySearch]);

  const selectCity = (result) => {
    setValue("birth_city", result.display_name, { shouldValidate: true });
    setValue("latitude", parseFloat(result.lat), { shouldValidate: true });
    setValue("longitude", parseFloat(result.lon), { shouldValidate: true });
    setCitySearch("");
    setSearchResults([]);
  };

  const nextStep = async (e) => {
    e.preventDefault();
    let isValid = false;
    if (step === 1) {
      isValid = await trigger("name");
      if (isValid) setStep(2);
    } else if (step === 2) {
      isValid = await trigger(["birth_date", "birth_time"]);
      if (isValid) setStep(3);
    } else if (step === 3) {
      isValid = await trigger("primaryGoal");
      if (isValid) setStep(4);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");

    try {
      // In a real app we would get the token from cookies.
      // Assuming Next.js API routes automatically pass the httpOnly cookie.
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The fetch API will automatically send cookies if they are on the same domain
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save onboarding data");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 100 : -100,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 100 : -100,
        opacity: 0,
      };
    },
  };

  return (
    <div
      className="min-h-screen px-4 flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 80% 0%, oklch(from var(--primary) l c h / 0.06) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.05) 0%, transparent 50%)",
      }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl -z-10" />

      <Card className="w-full max-w-lg border-primary/20 shadow-2xl bg-card/60 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h1 className="font-celestial text-4xl font-light italic text-foreground mb-2">
              Celestial Alignment
            </h1>
            <p className="text-muted-foreground text-sm">
              Step {step} of 4
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${
                    step >= i ? "bg-primary" : "bg-primary/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="w-full">
            <AnimatePresence mode="wait" initial={false} custom={1}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base text-primary/80">How should we address you?</Label>
                      <Input
                        id="name"
                        placeholder="Your full or preferred name"
                        className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12 text-lg"
                        {...register("name")}
                      />
                      {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date" className="text-base text-primary/80">When did your journey begin?</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12 text-lg"
                        {...register("birth_date")}
                      />
                      {errors.birth_date && <p className="text-destructive text-sm mt-1">{errors.birth_date.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="birth_time" className="text-base text-primary/80">Exact Time of Birth</Label>
                      <Input
                        id="birth_time"
                        type="time"
                        className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12 text-lg"
                        disabled={formValues.is_approximate_time}
                        {...register("birth_time")}
                      />
                      {errors.birth_time && <p className="text-destructive text-sm mt-1">{errors.birth_time.message}</p>}
                      <div className="flex items-center gap-2 mt-3">
                        <input
                          type="checkbox"
                          id="is_approximate_time"
                          className="w-4 h-4 rounded border-primary/20 bg-background/50 text-primary focus:ring-primary"
                          {...register("is_approximate_time", {
                            onChange: (e) => {
                              if (e.target.checked) {
                                setValue("birth_time", "12:00", { shouldValidate: true });
                              } else {
                                setValue("birth_time", "", { shouldValidate: true });
                              }
                            }
                          })}
                        />
                        <Label htmlFor="is_approximate_time" className="text-sm font-normal text-muted-foreground">
                          I don't know my exact birth time
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Astrological transits require precise timing.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base text-primary/80 block mb-1">What is your primary focus?</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Zorya combines your intention with celestial telemetry to tailor your daily CBT micro-habits.
                      </p>
                      
                      <div className="flex flex-wrap gap-3">
                        {GOAL_OPTIONS.map((goal) => (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => setValue("primaryGoal", goal, { shouldValidate: true })}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                              formValues.primaryGoal === goal 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-card/50 border-primary/20 text-foreground hover:border-primary/50"
                            }`}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                      {errors.primaryGoal && <p className="text-destructive text-sm mt-2">{errors.primaryGoal.message}</p>}
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="userNotes" className="text-sm text-primary/80">
                        Any specific challenge you're navigating today? (Optional)
                      </Label>
                      <Input
                        id="userNotes"
                        placeholder="e.g., Big exam coming up, feeling fatigued..."
                        className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12 text-md"
                        {...register("userNotes")}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <div className="space-y-4">
                    <div className="space-y-2 relative">
                      <Label htmlFor="citySearch" className="text-base text-primary/80">Where were you born?</Label>
                      <Input
                        id="citySearch"
                        value={formValues.birth_city || citySearch}
                        onChange={(e) => {
                          setValue("birth_city", "");
                          setCitySearch(e.target.value);
                        }}
                        placeholder="Search for your birth city..."
                        className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12 text-lg"
                      />
                      
                      {isSearching && (
                        <div className="absolute right-3 top-[38px]">
                          <Loader className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}

                      {searchResults.length > 0 && !formValues.birth_city && (
                        <div className="absolute top-[80px] w-full z-50 bg-card border border-primary/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((res) => (
                            <button
                              key={res.place_id}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors text-sm border-b border-primary/10 last:border-0"
                              onClick={() => selectCity(res)}
                            >
                              {res.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {errors.birth_city && <p className="text-destructive text-sm mt-1">{errors.birth_city.message}</p>}
                    </div>

                    {formValues.latitude && formValues.longitude && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-primary/5 border border-primary/20 rounded-lg mt-6"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm font-medium text-primary">Telemetry Locked</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm font-mono text-muted-foreground">
                          <div>
                            <span className="opacity-70 text-xs block mb-1">LATITUDE</span>
                            {formValues.latitude.toFixed(4)}°
                          </div>
                          <div>
                            <span className="opacity-70 text-xs block mb-1">LONGITUDE</span>
                            {formValues.longitude.toFixed(4)}°
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="mt-8 flex items-start gap-3 p-4 border border-border/50 rounded-lg bg-card/30">
                      <input
                        type="checkbox"
                        id="pdpa_consent"
                        className="mt-1 w-4 h-4 shrink-0 rounded border-primary/20 bg-background/50 text-primary focus:ring-primary"
                        {...register("pdpa_consent")}
                      />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="pdpa_consent" className="text-sm font-medium leading-normal text-foreground">
                          Sri Lanka PDPA Consent
                        </Label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          I consent to my birth coordinates being used to calculate personal astrological transits for CBT habit planning. I understand this data is processed securely and can be deleted at any time via Settings.
                        </p>
                        {errors.pdpa_consent && <p className="text-destructive text-xs mt-1">{errors.pdpa_consent.message}</p>}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className={`border-primary/20 hover:bg-primary/10 transition-opacity ${
                step === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              Back
            </Button>

            {step < 4 ? (
              <Button 
                onClick={nextStep} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                disabled={(step === 1 && !formValues.name) || (step === 2 && (!formValues.birth_date || !formValues.birth_time)) || (step === 3 && !formValues.primaryGoal)}
              >
                Continue
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || !formValues.latitude || !formValues.pdpa_consent}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
              >
                {isSubmitting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  "Align Chart"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
