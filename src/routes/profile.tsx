import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Upload, User, Trash2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StoreProvider, useStore } from "@/lib/store";
import { CURRENCIES } from "@/lib/currencies";
import { LANGUAGES } from "@/lib/languages";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Pocket Expense Tracker" },
      { name: "description", content: "Manage your avatar, currency, and language preferences." },
    ],
  }),
  component: () => (
    <StoreProvider>
      <ProfilePage />
      <Toaster richColors position="top-center" />
    </StoreProvider>
  ),
});

function ProfilePage() {
  const { profile, updateProfile, currency, setCurrency } = useStore();
  const [name, setName] = useState(profile.displayName);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync local state when store hydrates
  if (name === "" && profile.displayName) setTimeout(() => setName(profile.displayName), 0);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2_500_000) {
      toast.error("Image too large (max 2.5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: reader.result as string });
      toast.success("Avatar updated");
    };
    reader.readAsDataURL(file);
  };

  const saveName = () => {
    updateProfile({ displayName: name.trim() });
    toast.success("Profile saved");
  };

  const initials = (profile.displayName || "U")
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 glass">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-lg font-bold leading-none">Profile</h1>
            <p className="text-xs text-muted-foreground leading-none mt-1">Your preferences</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Card className="p-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> Identity
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                {profile.avatar && <AvatarImage src={profile.avatar} alt="Avatar" />}
                <AvatarFallback className="text-xl bg-gradient-hero text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
                </Button>
                {profile.avatar && (
                  <Button size="sm" variant="ghost"
                    onClick={() => { updateProfile({ avatar: "" }); toast.success("Avatar removed"); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
            </div>
            <div className="flex-1 w-full space-y-3">
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5"
                />
              </div>
              <Button onClick={saveName} disabled={name.trim() === profile.displayName}>
                Save
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold mb-1">Preferences</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Currency and language used across the app and AI insights.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => { setCurrency(v); toast.success("Currency updated"); }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select
                value={profile.language}
                onValueChange={(v) => { updateProfile({ language: v }); toast.success("Language updated"); }}
              >
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">
                AI insights will be generated in this language.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
