import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Dumbbell, Sparkles } from "lucide-react";
import { ExpenseTracker } from "@/components/lifestyle/ExpenseTracker";
import { WorkoutTracker } from "@/components/lifestyle/WorkoutTracker";

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
  const [tab, setTab] = useState<Tab>("expenses");

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
        </header>

        <main
          key={tab}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {tab === "expenses" ? <ExpenseTracker /> : <WorkoutTracker />}
        </main>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Data is kept in memory for this session.
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
