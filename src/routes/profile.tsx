import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StoreProvider, useStore } from "@/lib/store";
import { AuthProvider, useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { CURRENCIES } from "@/lib/currencies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "العربية" },
];

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Pocket" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ProfileContent />
        <Toaster richColors position="top-center" />
      </StoreProvider>
    </AuthProvider>
  );
}

function ProfileContent() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, updateProfile, loading } = useStore();
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name);
  }, [profile?.display_name]);

  if (authLoading || !user || loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return toast.error("Max 4MB");
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await updateProfile({ avatar_url: data.publicUrl });
    setUploading(false);
    toast.success("Avatar updated");
  };

  const initials = (profile?.display_name || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-30">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-2">
          <Button asChild variant="ghost" size="icon"><Link to="/"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="font-display text-lg font-bold">Profile & Settings</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload photo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG or PNG, up to 4MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Display name</Label>
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              <Button onClick={() => updateProfile({ display_name: name }).then(() => toast.success("Saved"))}>Save</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email ?? ""} disabled />
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="font-display font-semibold">Preferences</h2>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={profile?.currency ?? "USD"} onValueChange={(v) => updateProfile({ currency: v }).then(() => toast.success("Currency updated"))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-80">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={profile?.language ?? "en"} onValueChange={(v) => updateProfile({ language: v }).then(() => toast.success("Language updated"))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Currency formatting follows your selection. Full UI translation coming soon.</p>
          </div>
        </Card>
      </main>
    </div>
  );
}
