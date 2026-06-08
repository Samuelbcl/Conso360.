import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-50 via-sky-50/40 to-background" />
      <div className="pointer-events-none absolute -top-24 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="relative flex flex-col items-center gap-2">
        <Logo />
        <p className="text-sm text-muted-foreground">
          Le coach des dépenses de votre ménage
        </p>
      </div>
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
