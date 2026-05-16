import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider, useStore } from "@/lib/store";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Header } from "@/components/expense/Header";
import { StatCards } from "@/components/expense/StatCards";
import { TransactionForm } from "@/components/expense/TransactionForm";
import { TransactionList } from "@/components/expense/TransactionList";
import { Charts } from "@/components/expense/Charts";
import { Insights } from "@/components/expense/Insights";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pocket — Beautiful Expense Tracker" },
      { name: "description", content: "Track income, expenses, and savings across 35+ currencies with charts, AI insights, and cloud sync." },
      { property: "og:title", content: "Pocket — Beautiful Expense Tracker" },
      { property: "og:description", content: "Cloud-synced expense tracking with AI insights and beautiful charts." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Dashboard />
        <Toaster richColors position="top-center" />
      </StoreProvider>
    </AuthProvider>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading } = useStore();

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section>
          <h2 className="font-display text-3xl font-bold tracking-tight">Your Money, Clearly</h2>
          <p className="mt-1 text-muted-foreground">A real-time view of your income, spending, and balance — synced across devices.</p>
        </section>

        <StatCards />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6 min-w-0">
            <Charts />
            <Insights />
            <Card className="p-5">
              <h3 className="font-display font-semibold mb-4">Recent Transactions</h3>
              <TransactionList />
            </Card>
          </div>
          <aside>
            <Card className="p-5 sticky top-24">
              <h3 className="font-display font-semibold mb-4">Add Transaction</h3>
              <TransactionForm />
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
