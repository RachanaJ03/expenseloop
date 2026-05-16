import { Moon, Sun, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { CURRENCIES } from "@/lib/currencies";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function Header() {
  const { currency, setCurrency, theme, toggleTheme } = useStore();
  return (
    <header className="sticky top-0 z-30 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-hero p-2 shadow-glow">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-none">Pocket</h1>
            <p className="text-xs text-muted-foreground leading-none mt-1">Expense Tracker</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-80">
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
