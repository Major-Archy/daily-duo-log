import { useMemo, useState } from "react";
import { Dumbbell, Plus, Trash2, Flame, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WorkoutType =
  | "Strength"
  | "Cardio"
  | "Flexibility"
  | "Sports"
  | "Other";

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

export type Workout = {
  id: string;
  date: string;
  type: WorkoutType;
  duration: number;
  notes?: string;
  exercises?: Exercise[];
};

const TYPES: WorkoutType[] = [
  "Strength",
  "Cardio",
  "Flexibility",
  "Sports",
  "Other",
];

const TYPE_COLOR: Record<WorkoutType, string> = {
  Strength: "oklch(0.72 0.18 155)",
  Cardio: "oklch(0.7 0.18 30)",
  Flexibility: "oklch(0.7 0.18 200)",
  Sports: "oklch(0.75 0.16 80)",
  Other: "oklch(0.6 0.04 270)",
};

const today = () => new Date().toISOString().slice(0, 10);

export function WorkoutTracker() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [date, setDate] = useState(today());
  const [type, setType] = useState<WorkoutType>("Strength");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState("3");
  const [exReps, setExReps] = useState("10");
  const [exWeight, setExWeight] = useState("0");

  const addExercise = () => {
    if (!exName.trim()) return;
    setExercises((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: exName.trim(),
        sets: parseInt(exSets) || 0,
        reps: parseInt(exReps) || 0,
        weight: parseFloat(exWeight) || 0,
      },
    ]);
    setExName("");
  };

  const addWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseInt(duration);
    if (!dur || dur <= 0) return;
    setWorkouts((prev) => [
      {
        id: crypto.randomUUID(),
        date,
        type,
        duration: dur,
        notes: notes.trim() || undefined,
        exercises: type === "Strength" && exercises.length ? exercises : undefined,
      },
      ...prev,
    ]);
    setDuration("");
    setNotes("");
    setExercises([]);
  };

  const remove = (id: string) =>
    setWorkouts((prev) => prev.filter((w) => w.id !== id));

  // Streak: consecutive days with at least one workout, ending today or yesterday
  const streak = useMemo(() => {
    const dates = new Set(workouts.map((w) => w.date));
    let count = 0;
    const cursor = new Date();
    // allow streak to start from today or yesterday
    if (!dates.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!dates.has(cursor.toISOString().slice(0, 10))) return 0;
    }
    while (dates.has(cursor.toISOString().slice(0, 10))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [workouts]);

  // Last 7 days
  const week = useMemo(() => {
    const arr: { date: string; label: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const minutes = workouts
        .filter((w) => w.date === iso)
        .reduce((s, w) => s + w.duration, 0);
      arr.push({
        date: iso,
        label: d.toLocaleDateString(undefined, { weekday: "short" })[0],
        minutes,
      });
    }
    return arr;
  }, [workouts]);

  const weekTotal = week.reduce((s, d) => s + d.minutes, 0);
  const maxMin = Math.max(60, ...week.map((d) => d.minutes));

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Log workout</h3>
          </div>
          <form onSubmit={addWorkout} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="wdate">Date</Label>
                <Input
                  id="wdate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dur">Duration (min)</Label>
                <Input
                  id="dur"
                  type="number"
                  min="1"
                  placeholder="45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as WorkoutType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "Strength" && (
              <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
                <div className="text-xs font-medium text-muted-foreground">
                  Exercises
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <Input
                    className="col-span-12"
                    placeholder="Exercise name"
                    value={exName}
                    onChange={(e) => setExName(e.target.value)}
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    min="0"
                    placeholder="Sets"
                    value={exSets}
                    onChange={(e) => setExSets(e.target.value)}
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    min="0"
                    placeholder="Reps"
                    value={exReps}
                    onChange={(e) => setExReps(e.target.value)}
                  />
                  <Input
                    className="col-span-4"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Weight"
                    value={exWeight}
                    onChange={(e) => setExWeight(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addExercise}
                    className="col-span-2"
                  >
                    Add
                  </Button>
                </div>
                {exercises.length > 0 && (
                  <ul className="space-y-1 text-xs">
                    {exercises.map((ex) => (
                      <li
                        key={ex.id}
                        className="flex justify-between items-center bg-card rounded px-2 py-1"
                      >
                        <span className="font-medium">{ex.name}</span>
                        <span className="text-muted-foreground">
                          {ex.sets}×{ex.reps} @ {ex.weight}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="How did it feel?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button type="submit" variant="hero" className="w-full">
              Save workout
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-accent" />
            <h3 className="font-semibold">Streak</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-bold bg-[image:var(--gradient-accent)] bg-clip-text text-transparent">
              {streak}
            </div>
            <div className="text-muted-foreground">
              {streak === 1 ? "day" : "days"} in a row
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {streak === 0
              ? "Log a workout today to start your streak."
              : "Keep it going — show up tomorrow."}
          </p>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">This week</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {weekTotal} min total
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {week.map((d) => {
              const h = (d.minutes / maxMin) * 100;
              const active = d.minutes > 0;
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-md transition-all"
                      style={{
                        height: `${Math.max(h, 4)}%`,
                        background: active
                          ? "var(--gradient-primary)"
                          : "var(--muted)",
                      }}
                      title={`${d.minutes} min`}
                    />
                  </div>
                  <div
                    className={`text-xs ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Workout history</h3>
          </div>
          {workouts.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🏋️</div>
              <div className="font-medium">No workouts logged</div>
              <div className="text-sm text-muted-foreground">
                Your training log will appear here.
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {workouts.map((w) => (
                <li
                  key={w.id}
                  className="rounded-lg border border-border p-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center font-semibold text-sm"
                      style={{
                        background: `color-mix(in oklab, ${TYPE_COLOR[w.type]} 20%, transparent)`,
                        color: TYPE_COLOR[w.type],
                      }}
                    >
                      {w.type[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {w.type} · {w.duration} min
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {w.date}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(w.id)}
                      className="opacity-0 group-hover:opacity-100 transition"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {w.exercises && w.exercises.length > 0 && (
                    <ul className="mt-2 ml-13 pl-13 space-y-1 text-xs">
                      {w.exercises.map((ex) => (
                        <li
                          key={ex.id}
                          className="flex justify-between text-muted-foreground"
                        >
                          <span>{ex.name}</span>
                          <span>
                            {ex.sets}×{ex.reps}
                            {ex.weight > 0 ? ` @ ${ex.weight}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {w.notes && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      "{w.notes}"
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
