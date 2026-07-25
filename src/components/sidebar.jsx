import * as React from "react";
import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background hidden md:block h-screen fixed left-0 top-0">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold tracking-tight">Zorya</h1>
      </div>
      <div className="py-4">
        <nav className="px-4 space-y-2">
          <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Habits
          </Link>
          <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Settings
          </Link>
        </nav>
      </div>
    </aside>
  );
}
