import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function TransactionList() {
  const { transactions, currency, deleteTransaction } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (cat !== "all" && t.category !== cat) return false;
      if (q && !(t.note ?? "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [transactions, q, cat, type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="sm:w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
          No transactions yet. Add your first one!
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => {
            const c = getCategory(t.category);
            const Icon = c.icon;
            return (
              <li
                key={t.id}
                className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-md"
              >
                <div className={`rounded-lg bg-muted p-2.5 ${c.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{t.note || c.label}</p>
                    <p className={`font-display font-semibold tabular-nums ${t.type === "income" ? "text-income" : "text-expense"}`}>
                      {t.type === "income" ? "+" : "−"}{formatMoney(t.amount, currency)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{c.label}</span>
                    <span>{format(new Date(t.date), "MMM d, yyyy · HH:mm")}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTransaction(t.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
