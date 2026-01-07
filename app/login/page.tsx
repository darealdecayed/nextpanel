"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  async function submit(path: "login" | "register") {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const ct = res.headers.get("content-type") || "";
      const isJson = ct.includes("application/json");
      const data = isJson ? await res.json() : { error: await res.text() };
      if (!res.ok) throw new Error(data?.error || "Auth error");
      router.replace(next);
    } catch (e: any) {
      setError(e?.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-sm rounded-none">
        <CardContent className="space-y-4 p-6">
          <div>
            <h1 className="text-xl font-semibold">Welcome to NextPanel</h1>
            <p className="text-sm text-muted-foreground">Sign in or create an account</p>
          </div>
          <div className="space-y-2">
            <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-none" />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none" />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex gap-2">
            <Button className="rounded-none" disabled={loading} onClick={() => submit("login")}>Login</Button>
            <Button className="rounded-none" variant="outline" disabled={loading} onClick={() => submit("register")}>
              Register
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
