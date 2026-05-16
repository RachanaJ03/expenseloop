import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TxSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number(),
  category: z.string(),
  date: z.string(),
  note: z.string().optional(),
});

const InputSchema = z.object({
  transactions: z.array(TxSchema).max(2000),
  currency: z.string().min(1).max(8),
  language: z.string().min(2).max(8).default("en"),
});

export interface Insight {
  title: string;
  body: string;
  severity: "info" | "warn" | "good";
  emoji: string;
}

export interface InsightsResult {
  summary: string;
  insights: Insight[];
  tips: string[];
}

export const getInsights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<InsightsResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    // Aggregate this month vs last month per category
    const now = new Date();
    const thisMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
    const byMonthCat = new Map<string, Map<string, number>>();
    let thisIncome = 0, thisExpense = 0, lastIncome = 0, lastExpense = 0;

    for (const t of data.transactions) {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) continue;
      const m = d.getUTCFullYear() * 12 + d.getUTCMonth();
      const key = m === thisMonth ? "this" : m === thisMonth - 1 ? "last" : null;
      if (!key) continue;
      if (t.type === "expense") {
        if (key === "this") thisExpense += t.amount; else lastExpense += t.amount;
        const inner = byMonthCat.get(key) ?? new Map();
        inner.set(t.category, (inner.get(t.category) ?? 0) + t.amount);
        byMonthCat.set(key, inner);
      } else {
        if (key === "this") thisIncome += t.amount; else lastIncome += t.amount;
      }
    }

    const categoryChanges: { category: string; this: number; last: number; pctChange: number }[] = [];
    const cats = new Set([
      ...(byMonthCat.get("this")?.keys() ?? []),
      ...(byMonthCat.get("last")?.keys() ?? []),
    ]);
    for (const c of cats) {
      const t = byMonthCat.get("this")?.get(c) ?? 0;
      const l = byMonthCat.get("last")?.get(c) ?? 0;
      const pct = l === 0 ? (t > 0 ? 100 : 0) : ((t - l) / l) * 100;
      categoryChanges.push({ category: c, this: t, last: l, pctChange: pct });
    }
    categoryChanges.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange));

    const stats = {
      currency: data.currency,
      thisMonth: { income: thisIncome, expense: thisExpense },
      lastMonth: { income: lastIncome, expense: lastExpense },
      categoryChanges: categoryChanges.slice(0, 10),
      totalTransactions: data.transactions.length,
    };

    const prompt = `You are a friendly financial coach. Based on this user's spending data, generate insights in ${data.language} language.

DATA (currency: ${data.currency}):
${JSON.stringify(stats, null, 2)}

Return ONLY valid JSON matching this exact shape:
{
  "summary": "one-sentence overview of the month",
  "insights": [
    { "title": "short headline", "body": "1-2 sentence detail with concrete numbers/%", "severity": "info|warn|good", "emoji": "single emoji" }
  ],
  "tips": ["actionable saving tip", "..."]
}

Rules:
- 3 to 5 insights. Highlight unusual spending patterns and notable % changes (e.g. "You spent 20% more on Food this month").
- Use "warn" for concerning spikes, "good" for improvements, "info" otherwise.
- 2 to 4 short, practical tips.
- Numbers should reference the currency symbol naturally.
- No markdown, no preamble, JSON only.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a minute.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
    if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: InsightsResult;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: "Could not generate insights.", insights: [], tips: [] };
    }
    return parsed;
  });
