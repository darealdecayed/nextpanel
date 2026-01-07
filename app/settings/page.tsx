"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background text-foreground">
      <aside className="flex h-screen flex-col border-r border-border">
        <div className="px-4 py-4">
          <div className="text-xl font-semibold">NextPanel</div>
          <div className="text-xs text-muted-foreground">Settings</div>
        </div>
      </aside>

      <main className="flex h-screen flex-col">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>

        <div className="flex-1 space-y-6 overflow-auto p-6">
          <ThemeCard />

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>TOS Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Provide your Terms of Service here.
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>EULA</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Provide your End-User License Agreement here.
            </CardContent>
          </Card>

          <ServerManagementCard />
          <AccountManagementCard />
        </div>
      </main>
    </div>
  );
}

function ThemeCard() {
  const [loading, setLoading] = useState(false);

  async function randomizeTheme() {
    try {
      setLoading(true);
      const seed = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
      const res = await fetch(`https://www.thecolorapi.com/scheme?hex=${seed}&mode=monochrome-dark&count=5`);
      const data = await res.json();
      const colors: string[] = (data?.colors || []).map((c: any) => c?.hex?.value).filter(Boolean);
      if (colors.length >= 3) {
        setVars({
          "--primary": colors[0],
          "--accent": colors[1],
          "--ring": colors[2],
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // ensure dark mode stays enforced site-wide
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Themes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Generate a random dark palette with The Color API.
        </p>
        <Button className="rounded-none" onClick={randomizeTheme} disabled={loading}>
          {loading ? "Randomizing..." : "Randomize Theme"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ServerManagementCard() {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Server Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        Manage Docker via the main dashboard. Add more controls here.
      </CardContent>
    </Card>
  );
}

function AccountManagementCard() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  async function changePassword() {
    setStatus("");
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) setStatus(data?.error || "Failed to change password");
    else setStatus("Password updated");
    setPassword("");
  }
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Account Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex max-w-sm gap-2">
          <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none" />
          <Button className="rounded-none" onClick={changePassword}>Update</Button>
        </div>
        {status && <div className="text-sm text-muted-foreground">{status}</div>}
      </CardContent>
    </Card>
  );
}

function setVars(vars: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
