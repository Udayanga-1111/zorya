import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-end">
        <ThemeToggle />
      </header>
      
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Zorya</h1>
        <p className="text-lg text-muted-foreground">
          AI mental wellness platform.
        </p>
        <p className="text-sm text-muted-foreground/80">
          Mobile-first base setup with cosmic theme system.
        </p>
      </div>
    </main>
  );
}
