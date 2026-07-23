export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ userName: string }>;
}) {
  const { userName } = await params;
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div
      className="min-h-full px-8 py-10 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 80% 0%, oklch(from var(--primary) l c h / 0.06) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, oklch(0.7 0.15 300 / 0.05) 0%, transparent 50%)",
      }}
    >
      <div className="relative mx-auto max-w-4xl flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="font-celestial text-5xl font-light italic text-foreground mb-4">
          Onboarding
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Welcome to your wellness journey, {formattedName}. Your personalized onboarding process will appear here.
        </p>
      </div>
    </div>
  );
}
