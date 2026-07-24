"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LogOut, User } from "lucide-react";

export function ProfileButton({ userName }: { userName: string }) {
  const router = useRouter();

  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success("Logged out successfully");
      router.push("/pages/login");
      router.refresh(); // Clear Next.js router cache
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-10 w-10 border border-primary/20 bg-background/50 hover:bg-primary/10 transition-colors">
          <AvatarFallback className="bg-transparent text-primary font-celestial text-lg italic">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card/90 backdrop-blur-md border-primary/20">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem className="cursor-pointer focus:bg-primary/10 focus:text-primary">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="cursor-pointer focus:bg-destructive/10 focus:text-destructive text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
