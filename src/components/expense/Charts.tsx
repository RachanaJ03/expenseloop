import { useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { useStore } from "@/lib/store";
import { getCategory } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import { Card } from "@/components/ui/card";

const PALETTE = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
  "oklch(0.7 0.18 100)", "oklch(0.65 0.2 230)", "oklch(0.7 0.2 350)",
];

export function Charts() {
  const { transactions, currency } = useStore();

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });
    return [...map.entries()]
      .map(([id, value]) => ({ id, name: getCategory(id).label, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const last30 = useMemo(() => {
    const days: { date: string; income: number; expense: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      days.push({ date: format(d, "MMM d"), income: 0, expense: 0 });
    }
    transactions.forEach((t) => {
      const idx = 29 - Math.floor((Date.now() - new Date(t.date).getTime()) / 86400000);
      if (idx >= 0 && idx < 30) {
        days[idx][t.type] += t.amount;
      }
    });
    return days;
  }, [transactions]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="font-display font-semibold mb-1">Spending by Category</h3>
        <p className="text-sm text-muted-foreground mb-4">Where your money goes</p>
        {byCategory.length === 0 ? (
          <div className="h-64 grid place-items-center text-muted-foreground text-sm">No expenses yet</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatMoney(v, currency)}
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-display font-semibold mb-1">Last 30 Days</h3>
        <p className="text-sm text-muted-foreground mb-4">Income vs expenses</p>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={last30}>
              <defs>
                <linearGradient id="g-inc" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--income)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--income)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-exp" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} interval={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} width={40} />
              <Tooltip
                formatter={(v: number) => formatMoney(v, currency)}
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="income" stroke="var(--income)" fill="url(#g-inc)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" stroke="var(--expense)" fill="url(#g-exp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
