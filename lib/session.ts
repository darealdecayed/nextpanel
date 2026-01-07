import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: string;
  username?: string;
};

export const sessionOptions = {
  cookieName: "nextpanel_session",
  password: process.env.SESSION_SECRET || "insecure-dev-secret-change-me-please",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const c = await cookies();
  // @ts-expect-error iron-session types don't match cookies() return
  return getIronSession<SessionData>(c, sessionOptions);
}
