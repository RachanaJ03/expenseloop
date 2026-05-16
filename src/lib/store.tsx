import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Transaction } from "./expense-types";

const TX_KEY = "expense-tracker:transactions";
const CUR_KEY = "expense-tracker:currency";
const THEME_KEY = "expense-tracker:theme";

interface StoreCtx {
  transactions: Transaction[];
  currency: string;
  theme: "light" | "dark";
  setCurrency: (c: string) => void;
  toggleTheme: () => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrencyState] = useState<string>("USD");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTransactions(readLS<Transaction[]>(TX_KEY, []));
    setCurrencyState(readLS<string>(CUR_KEY, "USD"));
    setTheme(readLS<"light" | "dark">(THEME_KEY, "dark"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(TX_KEY, JSON.stringify(transactions));
  }, [transactions, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(CUR_KEY, JSON.stringify(currency));
  }, [currency, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]);
  }, []);
  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);
  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const clearAll = useCallback(() => setTransactions([]), []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <Ctx.Provider
      value={{
        transactions,
        currency,
        theme,
        setCurrency: setCurrencyState,
        toggleTheme,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        clearAll,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
