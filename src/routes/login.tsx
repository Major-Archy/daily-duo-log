import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Pulse" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    const { error } = await fn;
    setLoading(false);
    if (error) return setErr(error.message);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Pulse
          </div>
          <h1 className="mt-1 text-2xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "No account? Create one"
            : "Have an account? Sign in"}
        </button>
        <Link to="/" className="block text-xs text-center text-muted-foreground hover:text-foreground">
          Back home
        </Link>
      </Card>
    </div>
  );
}
