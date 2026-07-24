"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/Loader";

// Define our form data structure
interface SignupData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const [data, setData] = useState<SignupData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const updateData = (fields: Partial<SignupData>) => {
    setData((prev) => ({ ...prev, ...fields }));
    // Clear errors for fields being updated
    const newErrors = { ...errors };
    Object.keys(fields).forEach((key) => delete newErrors[key]);
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.name) newErrors.name = "Name is required.";
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = "Valid email is required.";
    if (!data.password || data.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (data.password !== data.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          toast.success("Account created successfully!");
          router.push(`/pages/${encodeURIComponent(result.user.name)}`);
        } else {
          toast.error(result.error || "Failed to create account");
          setErrors({ email: result.error || "Failed to create account" });
        }
      } catch (error) {
        console.error("Signup failed", error);
        toast.error("An unexpected error occurred");
        setErrors({ email: "An unexpected error occurred" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background" style={{ backgroundImage: 'radial-gradient(ellipse at 60% 0%, oklch(from var(--primary) l c h / 0.08) 0%, transparent 60%)' }}>
      <Loader isLoading={isSubmitting} />
      <Link href="/" className="absolute top-4 left-4 text-2xl font-bold tracking-tight text-primary flex items-center">
        Zorya
      </Link>
      
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-md border-primary/20 shadow-[0_8px_40px_-12px_oklch(from_var(--primary)_l_c_h_/_0.25)]">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create your profile</CardTitle>
          <CardDescription>Let's start with the basics to get you set up.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4 py-4 flex flex-col justify-center">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={data.name || ""} 
                onChange={(e) => updateData({ name: e.target.value })} 
                className="bg-background/50"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2 text-left">
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
            <div className="space-y-2 text-left">
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
            <div className="space-y-2 text-left">
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
        </CardContent>

        <CardFooter className="flex justify-between border-t border-border pt-6">
          <div className="text-sm text-muted-foreground">
            Already have an account? <Link href="/pages/login" className="text-primary hover:underline font-medium">Log in</Link>
          </div>
          
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
