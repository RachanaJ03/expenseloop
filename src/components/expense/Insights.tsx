import { useMemo, useState } from "react";
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { startOfMonth, subMonths, isAfter } from "date-fns";
import { useStore } from "@/lib/store";
import { useServerFn } from "@tanstack/react-start";
import { generateInsights } from "@/lib/insights.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { getCategory } from "@/lib/categories";

interface Change { category: string; thisMonth: number; lastMonth: number; pct: number | null; }

export function Insights() {
  const { transactions, currency } = useStore();
  const callAI = useServerFn(generateInsights);
  const [aiText, setAiText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { changes, anomalies } = useMemo(() => {
    const now = new Date();
    const thisStart = startOfMonth(now);
    const lastStart = startOfMonth(subMonths(now, 1));
    const totals = new Map<string, { now: number; prev: number }>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const d = new Date(t.date);
      const bucket = isAfter(d, thisStart) ? "now" : isAfter(d, lastStart) ? "prev" : null;
      if (!bucket) continue;
      const cur = totals.get(t.category) ?? { now: 0, prev: 0 };
      cur[bucket] += t.amount;
      totals.set(t.category, cur);
    }
    const changes: Change[] = [...totals.entries()]
      .map(([category, v]) => ({
        category,
        thisMonth: v.now,
        lastMonth: v.prev,
        pct: v.prev > 0 ? ((v.now - v.prev) / v.prev) * 100 : v.now > 0 ? null : 0,
      }))
      .filter((c) => c.thisMonth > 0 || c.lastMonth > 0)
      .sort((a, b) => Math.abs(b.thisMonth - b.lastMonth) - Math.abs(a.thisMonth - a.lastMonth))
      .slice(0, 5);

    // anomalies: expense > 2.5x category average
    const byCat = new Map<string, number[]>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const arr = byCat.get(t.category) ?? [];
      arr.push(t.amount);
      byCat.set(t.category, arr);
    }
    const anomalies = transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const arr = byCat.get(t.category) ?? [];
        if (arr.length < 4) return false;
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        return avg > 0 && t.amount > avg * 2.5;
      })
      .slice(0, 3);

    return { changes, anomalies };
  }, [transactions]);

  const askAI = async () => {
    if (transactions.length === 0) return;
    setLoading(true);
    setAiText("");
    try {
      const payload = transactions.slice(0, 200).map((t) => ({
        type: t.type, amount: t.amount, category: t.category, date: t.date, note: t.note,
      }));
      const res = await callAI({ data: { currency, transactions: payload } });
      setAiText(res.text);
    } catch (e) {
      setAiText("Couldn't generate insights right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> AI Insights
        </h3>
        <Button size="sm" variant="outline" onClick={askAI} disabled={loading || transactions.length === 0}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Generate saving tips"}
        </Button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add a few transactions to unlock insights.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Month-over-month</p>
            {changes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not enough history yet.</p>
            ) : (
              <ul className="space-y-2">
                {changes.map((c) => {
                  const cat = getCategory(c.category);
                  const up = (c.pct ?? 0) > 0;
                  const newCat = c.pct === null;
                  return (
                    <li key={c.category} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <div className={`rounded-md bg-muted p-1.5 ${cat.color}`}>
                        <cat.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(c.thisMonth, currency)} this month · {formatMoney(c.lastMonth, currency)} last
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${newCat ? "text-primary" : up ? "text-expense" : "text-income"}`}>
                        {newCat ? "NEW" : up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {!newCat && `${up ? "+" : ""}${(c.pct ?? 0).toFixed(0)}%`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {anomalies.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-expense" /> Unusual spending
              </p>
              <ul className="space-y-2">
                {anomalies.map((t) => {
                  const cat = getCategory(t.category);
                  return (
                    <li key={t.id} className="text-sm flex items-center justify-between gap-2 rounded-lg border border-expense/30 bg-expense/5 p-2.5">
                      <span className="truncate">{t.note || cat.label}</span>
                      <span className="font-semibold text-expense">{formatMoney(t.amount, currency)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {aiText && (
            <div className="rounded-lg border bg-accent/40 p-3 text-sm whitespace-pre-wrap leading-relaxed">
              {aiText}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
