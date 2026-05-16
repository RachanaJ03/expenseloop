import { useState } from "react";
import { Calculator as CalcIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { categoriesFor } from "@/lib/categories";
import { Calculator } from "./Calculator";
import type { TxType } from "@/lib/expense-types";

export function TransactionForm() {
  const { addTransaction } = useStore();
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  const cats = categoriesFor(type);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    addTransaction({
      type,
      amount: amt,
      category: cats.find((c) => c.id === category) ? category : cats[0].id,
      note: note.trim() || undefined,
      date: new Date(date).toISOString(),
    });
    toast.success(`${type === "income" ? "Income" : "Expense"} added`);
    setAmount("");
    setNote("");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Tabs value={type} onValueChange={(v) => { setType(v as TxType); setCategory(categoriesFor(v as TxType)[0].id); }}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="expense" className="data-[state=active]:bg-expense data-[state=active]:text-expense-foreground">Expense</TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-income data-[state=active]:text-income-foreground">Income</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="flex gap-2">
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-display"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Calculator">
                <CalcIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto">
              <Calculator onResult={(v) => setAmount(String(v))} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {cats.map((c) => {
              const Icon = c.icon;
              return (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${c.color}`} />
                    {c.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date & Time</Label>
        <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" placeholder="What was it for?" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} />
      </div>

      <Button type="submit" className="w-full shadow-glow" size="lg">
        <Plus className="h-4 w-4 mr-1" /> Add Transaction
      </Button>
    </form>
  );
}
