import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Check if the request is coming from the app subdomain
  const isAppSubdomain = hostname.startsWith("app.");

  // Define paths that should be under the app subdomain
  const appPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/auth/callback",
    "/home",
  ];

  // Allow root path on both domains
  if (url.pathname === "/") {
    return await updateSession(request);
  }

  // If the request is for an app path but not on the app subdomain
  if (
    appPaths.some((path) => url.pathname.startsWith(path)) &&
    !isAppSubdomain
  ) {
    // Redirect to app subdomain
    const newUrl = new URL(url);
    newUrl.host = `app.${hostname}`;
    return Response.redirect(newUrl);
  }

  // If the request is on the app subdomain but not for an app path
  if (
    isAppSubdomain &&
    !appPaths.some((path) => url.pathname.startsWith(path)) &&
    url.pathname !== "/"
  ) {
    // Redirect to main domain
    const newUrl = new URL(url);
    newUrl.host = hostname.replace("app.", "");
    return Response.redirect(newUrl);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
