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
