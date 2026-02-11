import { NextRequest, NextResponse } from "next/server";

const SUPPORTED = ["fr", "en"] as const;
type Lang = typeof SUPPORTED[number];

function detectFromHeader(req: NextRequest): Lang {
  const al = req.headers.get("accept-language") || "";
  // Very simple detection: prefer fr if listed first, else en
  const first = al.split(",")[0]?.trim().toLowerCase() || "";
  if (first.startsWith("fr")) return "fr";
  if (first.startsWith("en")) return "en";
  // default
  return "fr";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore next internals / static assets / api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico|css|js|map|txt)$/)
  ) {
    return NextResponse.next();
  }

  // If user is on /fr or /en, refresh cookie
  const match = pathname.match(/^\/(fr|en)(\/|$)/);
  if (match) {
    const lang = match[1] as Lang;
    const res = NextResponse.next();
    res.cookies.set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  // Root or any other path: redirect to /{lang}/...
  const cookieLang = req.cookies.get("lang")?.value as Lang | undefined;
  const lang: Lang = (cookieLang && SUPPORTED.includes(cookieLang)) ? cookieLang : detectFromHeader(req);

  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
