import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
          <Logo />
          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium sm:flex">
            <Link
              href="/pricing"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Tarifs
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Se connecter
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Commencer gratuitement
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer className="mt-auto border-t bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Logo />
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/pricing" className="hover:text-foreground">
                Tarifs
              </Link>
              <Link href="/login" className="hover:text-foreground">
                Connexion
              </Link>
              <Link href="/signup" className="hover:text-foreground">
                Créer un compte
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            © {APP_NAME} — service de comparaison et de suivi des dépenses du ménage
            (Belgique). Conso360 n&apos;est ni une autorité tarifaire ni un courtier
            agréé ; les tarifs affichés sont indicatifs.
          </p>
        </div>
      </footer>
    </div>
  );
}
