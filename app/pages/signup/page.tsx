"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

// Define our form data structure
interface SignupData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  birthDate?: string;
  birthTime?: string;
  location?: string;
  goal?: string;
  frequency?: string;
  termsAccepted?: boolean;
}

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SignupData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const totalSteps = 4;
  const progressPercentage = (step / totalSteps) * 100;

  const updateData = (fields: Partial<SignupData>) => {
    setData((prev) => ({ ...prev, ...fields }));
    // Clear errors for fields being updated
    const newErrors = { ...errors };
    Object.keys(fields).forEach((key) => delete newErrors[key]);
    setErrors(newErrors);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!data.name) newErrors.name = "Name is required.";
      if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = "Valid email is required.";
      if (!data.password || data.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
      if (data.password !== data.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    } else if (step === 2) {
      if (!data.birthDate) newErrors.birthDate = "Birth date is required.";
      if (!data.birthTime) newErrors.birthTime = "Birth time is required for accurate charting.";
      if (!data.location) newErrors.location = "Birth location is required.";
    } else if (step === 3) {
      if (!data.goal) newErrors.goal = "Please select a primary goal.";
      if (!data.frequency) newErrors.frequency = "Please select a check-in frequency.";
    } else if (step === 4) {
      if (!data.termsAccepted) newErrors.termsAccepted = "You must accept the terms and privacy policy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      setIsSubmitting(true);
      setShowLoader(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setShowLoader(false);
        // Normally redirect here
        console.log("Account created:", data);
        alert("Account created successfully!");
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background" style={{ backgroundImage: 'radial-gradient(ellipse at 60% 0%, oklch(from var(--primary) l c h / 0.08) 0%, transparent 60%)' }}>
      <Loader isLoading={showLoader} />
      <Link href="/" className="absolute top-4 left-4 text-2xl font-bold tracking-tight text-primary flex items-center">
        Zorya
      </Link>
      
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-md border-primary/20 shadow-[0_8px_40px_-12px_oklch(from_var(--primary)_l_c_h_/_0.25)]">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            {step > 1 ? (
              <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="w-9" />
            )}
            <div className="text-sm font-medium text-muted-foreground">
              Step {step} of {totalSteps}
            </div>
            <div className="w-9" />
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="text-center pt-4">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {step === 1 && "Create your profile"}
              {step === 2 && "Astrological details"}
              {step === 3 && "Tailor your journey"}
              {step === 4 && "Review & Confirm"}
            </CardTitle>
            <CardDescription className="mt-2">
              {step === 1 && "Let's start with the basics to get you set up."}
              {step === 2 && "We use this data to generate your precise natural cycle chart."}
              {step === 3 && "Help your AI companion understand how best to support you."}
              {step === 4 && "Make sure everything looks right before we finalize."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4 py-4 min-h-[300px] flex flex-col justify-center">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={data.name || ""} 
                    onChange={(e) => updateData({ name: e.target.value })} 
                    className="bg-background/50"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={data.email || ""} 
                    onChange={(e) => updateData({ email: e.target.value })} 
                    className="bg-background/50"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={data.password || ""} 
                    onChange={(e) => updateData({ password: e.target.value })} 
                    className="bg-background/50"
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={data.confirmPassword || ""} 
                    onChange={(e) => updateData({ confirmPassword: e.target.value })} 
                    className="bg-background/50"
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Your exact birth time and location are required to calculate the precise positioning of the stars at the moment of your birth.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date of Birth</Label>
                    <Input 
                      id="birthDate" 
                      type="date" 
                      value={data.birthDate || ""} 
                      onChange={(e) => updateData({ birthDate: e.target.value })} 
                      className="bg-background/50"
                    />
                    {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthTime">Time of Birth</Label>
                    <Input 
                      id="birthTime" 
                      type="time" 
                      value={data.birthTime || ""} 
                      onChange={(e) => updateData({ birthTime: e.target.value })} 
                      className="bg-background/50"
                    />
                    {errors.birthTime && <p className="text-sm text-destructive">{errors.birthTime}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">City of Birth</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. San Francisco, CA" 
                    value={data.location || ""} 
                    onChange={(e) => updateData({ location: e.target.value })} 
                    className="bg-background/50"
                  />
                  {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Primary Wellness Goal</Label>
                  <Select value={data.goal} onValueChange={(val) => updateData({ goal: val || undefined })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select your focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stress">Stress Management</SelectItem>
                      <SelectItem value="focus">Improving Focus & Clarity</SelectItem>
                      <SelectItem value="habits">Building Healthy Habits</SelectItem>
                      <SelectItem value="mood">Mood Regulation</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.goal && <p className="text-sm text-destructive">{errors.goal}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Preferred AI Check-in Frequency</Label>
                  <Select value={data.frequency} onValueChange={(val) => updateData({ frequency: val || undefined })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="How often should we chat?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily - Keep me closely accountable</SelectItem>
                      <SelectItem value="weekly">Weekly - A gentle summary</SelectItem>
                      <SelectItem value="adaptive">Adaptive - Sense when I need it</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.frequency && <p className="text-sm text-destructive">{errors.frequency}</p>}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-muted/30 p-5 rounded-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">Account</span>
                    <span className="font-medium text-sm">{data.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">Birth Chart Info</span>
                    <span className="font-medium text-sm text-right">
                      {data.birthDate} at {data.birthTime}<br/>
                      {data.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-sm text-muted-foreground">Focus</span>
                    <span className="font-medium text-sm capitalize">{data.goal} ({data.frequency})</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox 
                    id="terms" 
                    checked={data.termsAccepted || false}
                    onCheckedChange={(checked) => updateData({ termsAccepted: checked === true })}
                    className="mt-1"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium leading-normal cursor-pointer">
                      I agree to the Terms of Service and Privacy Policy.
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      We securely store your data to provide personalized insights.
                    </p>
                  </div>
                </div>
                {errors.termsAccepted && <p className="text-sm text-destructive ml-7">{errors.termsAccepted}</p>}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-border pt-6">
          <div className="text-sm text-muted-foreground">
            {step === 1 && (
              <>Already have an account? <Link href="/pages/login" className="text-primary hover:underline font-medium">Log in</Link></>
            )}
          </div>
          
          <Button onClick={step === totalSteps ? handleSubmit : handleNext} disabled={isSubmitting}>
            {step === totalSteps ? (
              <>{isSubmitting ? "Creating..." : "Create Account"}</>
            ) : (
              "Next Step"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
