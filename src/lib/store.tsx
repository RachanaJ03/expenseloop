import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type { Transaction } from "./expense-types";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  currency: string;
  language: string;
}

interface StoreCtx {
  transactions: Transaction[];
  currency: string;
  language: string;
  profile: Profile | null;
  theme: "light" | "dark";
  loading: boolean;
  setCurrency: (c: string) => Promise<void>;
  setLanguage: (l: string) => Promise<void>;
  updateProfile: (p: Partial<Profile>) => Promise<void>;
  toggleTheme: () => void;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<StoreCtx | null>(null);
const THEME_KEY = "expense-tracker:theme";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(true);

  // theme bootstrap
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = (localStorage.getItem(THEME_KEY) as "light" | "dark") || "dark";
    setTheme(t);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const loadAll = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: prof }, { data: txs }] = await Promise.all([
      supabase.from("profiles").select("display_name,avatar_url,currency,language").eq("id", user.id).maybeSingle(),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("occurred_at", { ascending: false }).limit(1000),
    ]);
    setProfile(prof ?? { display_name: null, avatar_url: null, currency: "USD", language: "en" });
    setTransactions(
      (txs ?? []).map((t) => ({
        id: t.id,
        type: t.type as "income" | "expense",
        amount: Number(t.amount),
        category: t.category,
        note: t.note ?? undefined,
        date: t.occurred_at,
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: t.type,
      amount: t.amount,
      category: t.category,
      note: t.note ?? null,
      occurred_at: t.date,
    }).select().single();
    if (error || !data) { toast.error(error?.message ?? "Failed to add"); return; }
    setTransactions((prev) => [{
      id: data.id, type: data.type as "income" | "expense", amount: Number(data.amount),
      category: data.category, note: data.note ?? undefined, date: data.occurred_at,
    }, ...prev]);
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    const prev = transactions;
    setTransactions((p) => p.filter((t) => t.id !== id));
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) { setTransactions(prev); toast.error(error.message); }
  }, [transactions]);

  const updateProfile = useCallback(async (patch: Partial<Profile>) => {
    if (!user) return;
    const next = { ...(profile ?? { display_name: null, avatar_url: null, currency: "USD", language: "en" }), ...patch };
    setProfile(next);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...next });
    if (error) toast.error(error.message);
  }, [user, profile]);

  const setCurrency = useCallback((c: string) => updateProfile({ currency: c }), [updateProfile]);
  const setLanguage = useCallback((l: string) => updateProfile({ language: l }), [updateProfile]);

  return (
    <Ctx.Provider value={{
      transactions,
      currency: profile?.currency ?? "USD",
      language: profile?.language ?? "en",
      profile,
      theme,
      loading,
      setCurrency,
      setLanguage,
      updateProfile,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      addTransaction,
      deleteTransaction,
      refresh: loadAll,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
