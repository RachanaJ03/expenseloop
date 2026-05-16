import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/expense/Header";
import { StatCards } from "@/components/expense/StatCards";
import { TransactionForm } from "@/components/expense/TransactionForm";
import { TransactionList } from "@/components/expense/TransactionList";
import { Charts } from "@/components/expense/Charts";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pocket — Beautiful Expense Tracker" },
      { name: "description", content: "Track income, expenses, and savings across 35+ currencies with charts, dark mode, and a built-in calculator." },
      { property: "og:title", content: "Pocket — Beautiful Expense Tracker" },
      { property: "og:description", content: "Track income, expenses, and savings across 35+ currencies with charts, dark mode, and a built-in calculator." },
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
    <StoreProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
          <section>
            <h2 className="font-display text-3xl font-bold tracking-tight">Your Money, Clearly</h2>
            <p className="mt-1 text-muted-foreground">A real-time view of your income, spending, and balance.</p>
          </section>

          <StatCards />

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6 min-w-0">
              <Charts />
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

          <footer className="pt-8 pb-4 text-center text-xs text-muted-foreground">
            Data is saved locally in your browser. Cloud sync, AI insights & OCR coming next.
          </footer>
        </main>
        <Toaster richColors position="top-center" />
      </div>
    </StoreProvider>
  );
}
