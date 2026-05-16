import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const TxSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number(),
  category: z.string().max(64),
  date: z.string(),
  note: z.string().max(500).optional(),
});

const InputSchema = z.object({
  currency: z.string().min(2).max(8),
  transactions: z.array(TxSchema).max(500),
});

export const generateInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const summary = summarize(data.transactions);
    const prompt = `You are a friendly personal-finance coach. The user's currency is ${data.currency}.
Based on this monthly spending summary, give 3-5 short, concrete saving tips (one sentence each) and call out anything unusual.
Be specific, use the actual numbers, keep it warm and non-judgmental. Use plain text, no markdown headings.

${summary}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a concise, kind personal-finance coach." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Rate limit hit. Try again in a minute.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
      throw new Error(`AI gateway error ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content ?? "No insights generated.";
    return { text };
  });

function summarize(txs: Array<z.infer<typeof TxSchema>>): string {
  const now = new Date();
  const thisMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const totals: Record<string, { now: number; prev: number }> = {};
  let incomeNow = 0, expenseNow = 0;
  for (const t of txs) {
    const d = new Date(t.date);
    const m = d.getUTCFullYear() * 12 + d.getUTCMonth();
    const bucket = m === thisMonth ? "now" : m === thisMonth - 1 ? "prev" : null;
    if (!bucket) continue;
    if (t.type === "expense") {
      totals[t.category] ??= { now: 0, prev: 0 };
      totals[t.category][bucket] += t.amount;
      if (bucket === "now") expenseNow += t.amount;
    } else if (bucket === "now") incomeNow += t.amount;
  }
  const lines = Object.entries(totals)
    .sort((a, b) => b[1].now - a[1].now)
    .slice(0, 10)
    .map(([cat, v]) => {
      const pct = v.prev > 0 ? `${(((v.now - v.prev) / v.prev) * 100).toFixed(0)}%` : "new";
      return `- ${cat}: ${v.now.toFixed(2)} this month (${v.prev.toFixed(2)} last, ${pct})`;
    });
  return `Income this month: ${incomeNow.toFixed(2)}\nExpenses this month: ${expenseNow.toFixed(2)}\nBy category:\n${lines.join("\n")}`;
}
