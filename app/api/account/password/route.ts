import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const schema = z.object({ password: z.string().min(6).max(128) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const json = await req.json();
    const { password } = schema.parse(json);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Update failed" }, { status: 400 });
  }
}
