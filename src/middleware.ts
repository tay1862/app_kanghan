import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((request) => {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!request.auth;

  const appHost = process.env.APP_HOST || "app.kanghan.site";
  const menuHost = process.env.MENU_HOST || "menu.kanghan.site";

  // Menu subdomain routing
  if (hostname === menuHost || hostname.startsWith("menu.")) {
    if (!pathname.startsWith("/menu") && !pathname.startsWith("/api/menu-pages") && !pathname.startsWith("/_next") && !pathname.startsWith("/uploads") && !pathname.startsWith("/logo")) {
      const url = request.nextUrl.clone();
      url.pathname = `/menu${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // App subdomain routing
  if (hostname === appHost || hostname.startsWith("app.")) {
    if (!pathname.startsWith("/app") && !pathname.startsWith("/api") && !pathname.startsWith("/_next") && !pathname.startsWith("/uploads") && !pathname.startsWith("/logo") && !pathname.startsWith("/manifest") && !pathname.startsWith("/icons") && !pathname.startsWith("/sw")) {
      const url = request.nextUrl.clone();
      url.pathname = `/app${pathname === "/" ? "/dashboard" : pathname}`;
      return NextResponse.rewrite(url);
    }
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/app/dashboard";
      return NextResponse.rewrite(url);
    }
  }

  // Auth protection: redirect unauthenticated users away from /app (except login)
  if (pathname.startsWith("/app") && !pathname.startsWith("/app/login")) {
    if (!isLoggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/app/login";
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from login page
  if (pathname.startsWith("/app/login") && isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return NextResponse.redirect(url);
  }

  // Localhost root redirect
  if ((hostname === "localhost:3009" || hostname === "localhost") && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
