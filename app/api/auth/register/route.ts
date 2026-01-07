import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

const schema = z.object({ username: z.string().min(3).max(32), password: z.string().min(6).max(128) });

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { username, password } = schema.parse(json);
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { username, passwordHash } });
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    await session.save();
    return NextResponse.json({ ok: true, username: user.username });
  } catch (e: any) {
    const message = e?.message || "Registration error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
