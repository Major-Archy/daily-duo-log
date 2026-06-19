import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, Dumbbell, Sparkles, LogOut } from "lucide-react";
import { ExpenseTracker } from "@/components/lifestyle/ExpenseTracker";
import { WorkoutTracker } from "@/components/lifestyle/WorkoutTracker";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pulse — Personal Lifestyle Tracker" },
      {
        name: "description",
        content:
          "Track expenses and workouts in one beautiful, fast personal dashboard.",
      },
    ],
  }),
});

type Tab = "expenses" | "workouts";

function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("expenses");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Personal lifestyle tracker
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                Pulse
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              role="tablist"
              aria-label="Sections"
              className="inline-flex p-1 rounded-full bg-card border border-border shadow-sm"
            >
              <TabButton
                active={tab === "expenses"}
                onClick={() => setTab("expenses")}
                icon={<Wallet className="h-4 w-4" />}
                label="Expenses"
              />
              <TabButton
                active={tab === "workouts"}
                onClick={() => setTab("workouts")}
                icon={<Dumbbell className="h-4 w-4" />}
                label="Workouts"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main
          key={tab}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {tab === "expenses" ? (
            <ExpenseTracker userId={user.id} />
          ) : (
            <WorkoutTracker userId={user.id} />
          )}
        </main>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Signed in as {user.email} · Data is saved to your account.
        </footer>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all " +
        (active
          ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {icon}
      {label}
    </button>
  );
}
