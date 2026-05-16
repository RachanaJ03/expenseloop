import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { getInsights, type InsightsResult } from "@/lib/insights.functions";
import { toast } from "sonner";

export function AIInsights() {
  const { transactions, currency, profile } = useStore();
  const fetchInsights = useServerFn(getInsights);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InsightsResult | null>(null);

  const run = async () => {
    if (transactions.length === 0) {
      toast.error("Add some transactions first");
      return;
    }
    setLoading(true);
    try {
      const r = await fetchInsights({
        data: {
          transactions: transactions.map((t) => ({
            type: t.type,
            amount: t.amount,
            category: t.category,
            date: t.date,
            note: t.note,
          })),
          currency,
          language: profile.language || "en",
        },
      });
      setResult(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-gradient-hero p-2 shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold leading-tight">AI Insights</h3>
            <p className="text-xs text-muted-foreground">Spending patterns & monthly trends</p>
          </div>
        </div>
        <Button size="sm" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span className="ml-2">{result ? "Refresh" : "Analyze"}</span>
        </Button>
      </div>

      {!result && !loading && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Click <span className="font-medium text-foreground">Analyze</span> to get a monthly summary,
          unusual-pattern alerts, and personalized saving tips.
        </p>
      )}

      {loading && !result && (
        <div className="space-y-3 py-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card/50 p-3 text-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" /> Monthly summary
            </div>
            {result.summary}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {result.insights.map((ins, i) => {
              const Icon = ins.severity === "warn" ? AlertTriangle
                : ins.severity === "good" ? CheckCircle2 : TrendingUp;
              const tone = ins.severity === "warn"
                ? "border-expense/30 bg-expense/5"
                : ins.severity === "good"
                ? "border-income/30 bg-income/5"
                : "border-border bg-muted/30";
              const iconTone = ins.severity === "warn" ? "text-expense"
                : ins.severity === "good" ? "text-income" : "text-primary";
              return (
                <div key={i} className={`rounded-lg border p-3 ${tone}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg leading-none">{ins.emoji}</span>
                    <h4 className="font-medium text-sm leading-tight">{ins.title}</h4>
                    <Icon className={`h-3.5 w-3.5 ml-auto ${iconTone}`} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.body}</p>
                </div>
              );
            })}
          </div>

          {result.tips.length > 0 && (
            <div className="rounded-lg border bg-card/50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <Lightbulb className="h-3.5 w-3.5" /> Saving tips
              </div>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
