import {
  Utensils, Car, Home, ShoppingBag, Receipt, HeartPulse, Film, Plane,
  GraduationCap, Briefcase, Laptop, TrendingUp, Gift, Repeat, Coffee,
  Wallet, DollarSign, PiggyBank, Sparkles, MoreHorizontal,
} from "lucide-react";

export interface Category {
  id: string;
  label: string;
  icon: typeof Utensils;
  type: "income" | "expense" | "both";
  color: string; // tailwind class
}

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food & Dining", icon: Utensils, type: "expense", color: "text-orange-500" },
  { id: "transport", label: "Transport", icon: Car, type: "expense", color: "text-blue-500" },
  { id: "rent", label: "Rent / Housing", icon: Home, type: "expense", color: "text-purple-500" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, type: "expense", color: "text-pink-500" },
  { id: "bills", label: "Bills & Utilities", icon: Receipt, type: "expense", color: "text-yellow-500" },
  { id: "health", label: "Health", icon: HeartPulse, type: "expense", color: "text-red-500" },
  { id: "entertainment", label: "Entertainment", icon: Film, type: "expense", color: "text-fuchsia-500" },
  { id: "travel", label: "Travel", icon: Plane, type: "expense", color: "text-sky-500" },
  { id: "education", label: "Education", icon: GraduationCap, type: "expense", color: "text-indigo-500" },
  { id: "coffee", label: "Coffee", icon: Coffee, type: "expense", color: "text-amber-600" },
  { id: "subscription", label: "Subscriptions", icon: Repeat, type: "expense", color: "text-cyan-500" },
  { id: "gift", label: "Gifts", icon: Gift, type: "both", color: "text-rose-500" },
  { id: "salary", label: "Salary", icon: Briefcase, type: "income", color: "text-emerald-500" },
  { id: "freelance", label: "Freelance", icon: Laptop, type: "income", color: "text-teal-500" },
  { id: "investment", label: "Investment", icon: TrendingUp, type: "income", color: "text-green-500" },
  { id: "savings", label: "Savings", icon: PiggyBank, type: "both", color: "text-lime-500" },
  { id: "bonus", label: "Bonus", icon: Sparkles, type: "income", color: "text-yellow-400" },
  { id: "cash", label: "Cash", icon: Wallet, type: "both", color: "text-stone-500" },
  { id: "other-income", label: "Other Income", icon: DollarSign, type: "income", color: "text-green-600" },
  { id: "other", label: "Other", icon: MoreHorizontal, type: "both", color: "text-muted-foreground" },
];

export const getCategory = (id: string) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export const categoriesFor = (type: "income" | "expense") =>
  CATEGORIES.filter((c) => c.type === type || c.type === "both");
