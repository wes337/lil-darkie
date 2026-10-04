import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server.js";

const LOGIN_PATH = "/__preview/login";
const LOGO_PATH = "/images/social/lil-darkie-logo.png";
const COOKIE_NAME = "preview-access";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

// Timing-safe string comparison.
export function matches(left, right) {
  const hash = (value) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(left), hash(right));
}

function signature(payload, password, scope) {
  return createHmac("sha256", password)
    .update(`${scope}:${payload}`)
    .digest("base64url");
}

// A signed, expiring cookie value. `scope` keeps a session made for one gate
// (preview, admin) from passing another, even when the passwords match.
export function createSession(password, scope = COOKIE_NAME) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${expires}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload, password, scope)}`;
}

export function validSession(token, password, scope = COOKIE_NAME) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, signed] = parts;
  return (
    /^\d+$/.test(expires) &&
    Number(expires) > Math.floor(Date.now() / 1000) &&
    /^[a-f0-9]{32}$/.test(nonce) &&
    matches(signed, signature(`${expires}.${nonce}`, password, scope))
  );
}

// Keep post-login navigation on this site, including when a link is hand-edited.
function returnPath(value) {
  if (!value?.startsWith("/") || /[\\\r\n]/.test(value)) return "/";
  const base = "https://preview.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base || url.pathname.startsWith(LOGIN_PATH)) return "/";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

function privateResponse(response) {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function loginPage(next, error = false) {
  const action = `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
  return privateResponse(new NextResponse(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lil Darkie preview</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100svh; display: grid; place-items: center; padding: 24px; background: #090909; color: #f3efeb; font-family: ui-monospace, monospace; }
      main { width: 100%; max-width: 360px; }
      h1 { margin: 0 0 32px; }
      .logo { display: block; width: 100%; height: auto; }
      label { display: block; margin-bottom: 10px; font-size: 14px; }
      input, button { width: 100%; min-height: 48px; border-radius: 0; font: inherit; }
      input { padding: 12px; border: 1px solid #666; background: #141414; color: #fff; }
      input:focus-visible, button:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }
      button { margin-top: 20px; padding: 12px; border: 0; background: #ed302b; color: #fff; cursor: pointer; }
      button:hover { background: #c9221e; }
      .error { margin: 12px 0 0; color: #ff8d89; font-size: 14px; }
    </style>
  </head>
  <body>
    <main>
      <h1><img class="logo" src="${LOGO_PATH}" alt="Lil Darkie" width="300" height="82"></h1>
      <form method="post" action="${action}">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus${error ? ' aria-invalid="true" aria-describedby="password-error"' : ""}>
        ${error ? '<p class="error" id="password-error" role="alert">Incorrect password. Try again.</p>' : ""}
        <button type="submit">Enter</button>
      </form>
    </main>
  </body>
</html>`, {
    status: error ? 401 : 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  }));
}

// Only the login logo is public; game assets and app scripts remain protected.
export async function previewAccess(request, { password, environment }) {
  if (!password || environment === "production") return NextResponse.next();
  if (request.nextUrl.pathname === LOGO_PATH) return privateResponse(NextResponse.next());

  const isLogin = request.nextUrl.pathname === LOGIN_PATH;
  const next = returnPath(request.nextUrl.searchParams.get("next"));
  if (validSession(request.cookies.get(COOKIE_NAME)?.value, password)) {
    return privateResponse(isLogin
      ? NextResponse.redirect(new URL(next, request.url), 303)
      : NextResponse.next());
  }

  if (!isLogin) {
    const login = new URL(LOGIN_PATH, request.url);
    login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return privateResponse(NextResponse.redirect(login, 303));
  }

  if (request.method === "GET" || request.method === "HEAD") return loginPage(next);
  if (request.method !== "POST") {
    return privateResponse(new NextResponse(null, {
      status: 405,
      headers: { Allow: "GET, HEAD, POST" },
    }));
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return privateResponse(new NextResponse("Forbidden", { status: 403 }));
  }

  let submitted;
  try {
    submitted = (await request.formData()).get("password");
  } catch {
    return loginPage(next, true);
  }
  if (typeof submitted !== "string" || !matches(submitted, password)) {
    return loginPage(next, true);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(COOKIE_NAME, createSession(password), {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return privateResponse(response);
}
