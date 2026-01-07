import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({ username: z.string().min(3).max(32), password: z.string().min(6).max(128) });

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { username, password } = schema.parse(json);
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    await session.save();
    return NextResponse.json({ ok: true, username: user.username });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Login error" }, { status: 400 });
  }
}
