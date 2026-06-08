import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4">
          <Link href="/" className="font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <nav className="ml-6 hidden items-center gap-4 text-sm sm:flex">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Tarifs
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
              Se connecter
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
              Commencer
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {APP_NAME} — service de comparaison et de suivi (Belgique).</p>
          <p>
            Conso360 n&apos;est ni une autorité tarifaire ni un courtier agréé. Tarifs
            affichés à titre indicatif.
          </p>
        </div>
      </footer>
    </div>
  );
}
