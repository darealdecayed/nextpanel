"use client";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Boxes,
  HardDrive,
  Network,
  Database,
  Settings,
  RefreshCw,
  Search,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faYoutube, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ContainerSummary = {
  Id: string;
  Names?: string[];
  Image: string;
  State: string;
  Status?: string;
  Ports: Array<{
    IP?: string;
    PrivatePort: number;
    PublicPort?: number;
    Type: string;
  }>;
};

export default function Home() {
  const [containers, setContainers] = useState<ContainerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/containers", { cache: "no-store" });
      const data = await res.json();
      setContainers(Array.isArray(data) ? data : []);
    } catch (e) {
      setContainers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return containers;
    return containers.filter((c) => {
      const name = c.Names?.[0]?.replace(/^\//, "") || c.Id.slice(0, 12);
      return (
        name.toLowerCase().includes(q) ||
        c.Image.toLowerCase().includes(q) ||
        (c.Status || "").toLowerCase().includes(q)
      );
    });
  }, [containers, query]);

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex h-screen flex-col border-r border-border">
        <div className="px-4 py-4">
          <div className="text-xl font-semibold">NextPanel</div>
          <div className="text-xs text-muted-foreground">v{process.env.NEXT_PUBLIC_APP_VERSION}</div>
        </div>
        <Separator />
        <nav className="flex-1 p-2">
          <SidebarItem icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <SidebarItem icon={<Boxes size={16} />} label="Containers" active />
          <SidebarItem icon={<HardDrive size={16} />} label="Images" />
          <SidebarItem icon={<Network size={16} />} label="Networks" />
          <SidebarItem icon={<Database size={16} />} label="Volumes" />
          <SidebarItem icon={<Settings size={16} />} label="Settings" />
        </nav>
        <Separator />
        <div className="p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <a className="text-muted-foreground hover:text-foreground" href="https://discord.com" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faDiscord} className="h-4 w-4" />
              </a>
              <a className="text-muted-foreground hover:text-foreground" href="https://youtube.com" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faYoutube} className="h-4 w-4" />
              </a>
              <a className="text-muted-foreground hover:text-foreground" href="https://x.com" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex h-screen flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Containers</h1>
            <p className="text-sm text-muted-foreground">View and manage your Docker containers.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-none" onClick={load} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Card className="rounded-none">
            <CardHeader className="gap-4 sm:flex-row sm:items-center">
              <CardTitle className="text-base">All Containers</CardTitle>
              <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-8 rounded-none" placeholder="Search containers..." value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ports</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          Loading containers...
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          No containers found or Docker not accessible.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((c) => (
                        <TableRow key={c.Id}>
                          <TableCell className="font-medium">
                            {c.Names?.[0]?.replace(/^\//, "") || c.Id.slice(0, 12)}
                          </TableCell>
                          <TableCell>{c.Image}</TableCell>
                          <TableCell>
                            <Badge variant={c.State === "running" ? "default" : "secondary"} className="rounded-none">
                              {c.State}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{c.Status}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatPorts(c.Ports)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-2">
                              <Button size="sm" variant="outline" className="rounded-none">Details</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function formatPorts(ports: ContainerSummary["Ports"]) {
  if (!ports || ports.length === 0) return "-";
  return ports
    .map((p) =>
      p.PublicPort
        ? `${p.IP === "0.0.0.0" ? "*" : p.IP}:${p.PublicPort}->${p.PrivatePort}/${p.Type}`
        : `${p.PrivatePort}/${p.Type}`
    )
    .join(", ");
}
