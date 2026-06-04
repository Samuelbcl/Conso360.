"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink, signIn, signUp, type AuthState } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  next,
  initialError,
}: {
  mode: Mode;
  next?: string;
  initialError?: string;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (initialError) toast.error("Échec de l'authentification. Réessayez.");
  }, [initialError]);

  const handle = (result: AuthState) => {
    if (!result) return; // redirection serveur en cas de succès
    if (result.ok) {
      toast.success(result.message ?? "C'est fait.");
    } else {
      toast.error(result.error);
    }
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result =
        mode === "login"
          ? await signIn({ email, password }, next)
          : await signUp({ fullName, email, password });
      handle(result);
    });
  }

  function onMagicLink() {
    if (!email) {
      toast.error("Saisissez votre e-mail pour recevoir un lien.");
      return;
    }
    startTransition(async () => {
      handle(await sendMagicLink({ email }));
    });
  }

  function onGoogle() {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            next ?? "/dashboard",
          )}`,
        },
      });
      // En cas de succès, le navigateur est redirigé vers Google automatiquement.
      if (error) toast.error("Connexion Google indisponible. Réessayez.");
    });
  }

  const isLogin = mode === "login";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isLogin ? "Connexion" : "Créer un compte"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Accédez à votre tableau de bord Conso360."
            : "Quelques secondes pour commencer à réduire vos factures."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          {!isLogin && (
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? undefined : 8}
            />
          </div>
        </CardContent>

        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? "Veuillez patienter…"
              : isLogin
                ? "Se connecter"
                : "Créer mon compte"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={onMagicLink}
          >
            Recevoir un lien de connexion
          </Button>

          <div className="relative w-full py-1 text-center text-xs text-muted-foreground">
            <span className="relative z-10 bg-card px-2">ou</span>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={onGoogle}
          >
            <GoogleIcon />
            Continuer avec Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Pas encore de compte ?{" "}
                <Link href="/signup" className="font-medium text-foreground underline">
                  Créer un compte
                </Link>
              </>
            ) : (
              <>
                Déjà inscrit ?{" "}
                <Link href="/login" className="font-medium text-foreground underline">
                  Se connecter
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
