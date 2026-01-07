import { NextResponse } from "next/server";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const pexec = promisify(exec);
export const runtime = "nodejs";

export async function GET() {
  try {
    const { stdout } = await pexec(`docker ps -a --format '{{json .}}'`);
    const lines = stdout
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const items = lines.map((l) => {
      const o = JSON.parse(l);
      return mapDockerCliToSummary(o);
    });
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to list containers via CLI" },
      { status: 500 }
    );
  }
}

function mapDockerCliToSummary(o: any) {
  const id = o.ID || o.Id || "";
  const names = o.Names ? [String(o.Names)] : [];
  const image = String(o.Image || "");
  const status = String(o.Status || "");
  const state = String(o.State || deriveState(status));
  const portsStr = String(o.Ports || "");
  const ports = parsePorts(portsStr);
  return {
    Id: id,
    Names: names,
    Image: image,
    State: state,
    Status: status,
    Ports: ports,
  };
}

function deriveState(status: string) {
  const s = status.toLowerCase();
  if (s.startsWith("up")) return "running";
  if (s.startsWith("exited")) return "exited";
  if (s.includes("paused")) return "paused";
  return "unknown";
}

function parsePorts(ports: string) {
  if (!ports) return [] as Array<any>;
  return ports.split(", ").map((entry) => {
    entry = entry.trim();
    if (!entry) return { PrivatePort: 0, Type: "" };
    if (entry.includes("->")) {
      const [left, right] = entry.split("->");
      const [privStr, type = ""] = right.split("/");
      const privatePort = Number(privStr) || 0;
      let ip: string | undefined;
      let publicPort: number | undefined;
      const idx = left.lastIndexOf(":");
      if (idx !== -1) {
        ip = left.slice(0, idx);
        publicPort = Number(left.slice(idx + 1)) || undefined;
      } else {
        publicPort = Number(left) || undefined;
      }
      return {
        IP: ip || undefined,
        PublicPort: publicPort,
        PrivatePort: privatePort,
        Type: type,
      };
    } else {
      const [privStr, type = ""] = entry.split("/");
      return {
        PrivatePort: Number(privStr) || 0,
        Type: type,
      };
    }
  });
}
