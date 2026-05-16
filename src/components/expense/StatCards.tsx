import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import { Card } from "@/components/ui/card";

export function StatCards() {
  const { transactions, currency } = useStore();
  const income = transactions.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  const cards = [
    { label: "Balance", value: balance, icon: Wallet, gradient: "bg-gradient-hero", fg: "text-primary-foreground" },
    { label: "Income", value: income, icon: ArrowUpRight, gradient: "bg-gradient-income", fg: "text-income-foreground" },
    { label: "Expenses", value: expense, icon: ArrowDownRight, gradient: "bg-gradient-expense", fg: "text-expense-foreground" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className={`${c.gradient} ${c.fg} border-0 p-6 shadow-glow overflow-hidden relative`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm/none opacity-80 font-medium">{c.label}</p>
                <p className="mt-3 text-3xl font-display font-bold tracking-tight">
                  {formatMoney(c.value, currency)}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-2.5 backdrop-blur">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
