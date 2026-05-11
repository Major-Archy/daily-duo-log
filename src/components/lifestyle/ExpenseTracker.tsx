import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useEffect } from "react";
import { Wallet, Plus, Trash2, TrendingUp } from "lucide-react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Entertainment"
  | "Health"
  | "Shopping"
  | "Other";

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
};

const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "oklch(0.72 0.18 155)",
  Transport: "oklch(0.7 0.18 200)",
  Entertainment: "oklch(0.7 0.18 30)",
  Health: "oklch(0.65 0.2 350)",
  Shopping: "oklch(0.75 0.16 80)",
  Other: "oklch(0.6 0.04 270)",
};

const today = () => new Date().toISOString().slice(0, 10);

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = usePersistentState<number>("pulse:budget", 1500);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(today());

useEffect(() => {
  supabase.from("expenses").select("*")
    .order("created_at", { ascending: false })
    .then(({ data }) => {
      if (data) setExpenses(data as Expense[]);
    });
}, []);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    const newExpense = {
  amount: value,
  category,
  description: description.trim() || category,
  date,
};
await supabase.from("expenses").insert(newExpense);
const { data } = await supabase.from("expenses").select("*")
  .order("created_at", { ascending: false });
if (data) setExpenses(data as Expense[]);
    setAmount("");
    setDescription("");
  };

  const remove = (id: string) =>
    setExpenses((prev) => prev.filter((x) => x.id !== id));

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const breakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const e of monthExpenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return CATEGORIES.map((c) => ({ name: c, value: map.get(c) ?? 0 })).filter(
      (x) => x.value > 0,
    );
  }, [monthExpenses]);

  const budgetPct = budget > 0 ? Math.min(100, (monthTotal / budget) * 100) : 0;
  const overBudget = monthTotal > budget;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Add expense</h3>
          </div>
          <form onSubmit={addExpense} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ExpenseCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                placeholder="Coffee, taxi, movie…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button type="submit" variant="hero" className="w-full">
              Add expense
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Monthly budget</h3>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <div className="flex-1">
              <Label htmlFor="budget">Limit</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Spent</div>
              <div
                className={`text-2xl font-bold ${overBudget ? "text-destructive" : "text-primary"}`}
              >
                ${monthTotal.toFixed(0)}
              </div>
            </div>
          </div>
          <Progress value={budgetPct} className="h-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            {overBudget
              ? `Over by $${(monthTotal - budget).toFixed(2)}`
              : `$${(budget - monthTotal).toFixed(2)} remaining this month`}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">This month</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {monthExpenses.length} transactions
            </div>
          </div>
          {breakdown.length === 0 ? (
            <EmptyState
              icon="💸"
              title="No expenses yet"
              text="Add your first expense to see your breakdown."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div className="h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {breakdown.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name as ExpenseCategory]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(v: number) => `$${v.toFixed(2)}`}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {breakdown
                  .sort((a, b) => b.value - a.value)
                  .map((b) => (
                    <div key={b.name} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          background:
                            CATEGORY_COLORS[b.name as ExpenseCategory],
                        }}
                      />
                      <div className="flex-1 text-sm">{b.name}</div>
                      <div className="text-sm font-medium">
                        ${b.value.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground w-12 text-right">
                        {((b.value / monthTotal) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent transactions</h3>
            {expenses.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm("Delete all expenses?")) setExpenses([]);
                }}
              >
                Clear all
              </Button>
            )}
          </div>
          {expenses.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="Nothing here yet"
              text="Your transactions will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {expenses.slice(0, 12).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 py-3 group"
                >
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      background: `color-mix(in oklab, ${CATEGORY_COLORS[e.category]} 20%, transparent)`,
                      color: CATEGORY_COLORS[e.category],
                    }}
                  >
                    {e.category[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {e.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.category} · {e.date}
                    </div>
                  </div>
                  <div className="font-semibold text-sm">
                    -${e.amount.toFixed(2)}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(e.id)}
                    className="opacity-0 group-hover:opacity-100 transition"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center py-10">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  );
}
