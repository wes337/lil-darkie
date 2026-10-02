import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { previewAccess } from "./preview-access.mjs";

const origin = "https://preview.example";
const settings = { password: "test-password", environment: "preview" };

function request(path, options) {
  return new NextRequest(new URL(path, origin), options);
}

function login(password = settings.password, path = "/__preview/login") {
  return previewAccess(request(path, {
    method: "POST",
    headers: { origin },
    body: new URLSearchParams({ password }),
  }), settings);
}

test("protects pages, public media, and Next.js requests without a cookie", async () => {
  const logo = await previewAccess(request("/images/social/lil-darkie-logo.png"), settings);
  assert.equal(logo.headers.get("x-middleware-next"), "1");
  for (const path of ["/", "/gallery?test=1", "/red-game/final/music.m4a", "/red-game/final/ending.mp4", "/_next/static/chunks/app.js", "/_next/image?url=test", "/?_rsc=test"]) {
    const response = await previewAccess(request(path), settings);
    assert.equal(response.status, 303, path);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.pathname, "/__preview/login");
    assert.equal(location.searchParams.get("next"), path);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  }
});

test("login screen does not expose the password, and rejects incorrect input", async () => {
  const page = await previewAccess(request("/__preview/login"), settings);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /type="password"/);
  const response = await login("wrong-password");
  assert.equal(response.status, 401);
  assert.equal(response.cookies.getAll().length, 0);
  const html = await response.text();
  assert.match(html, /Incorrect password/);
  assert.ok(!html.includes(settings.password));
  assert.ok(!html.includes("wrong-password"));
});

test("successful login issues a private cookie and preserves the requested URL", async () => {
  const response = await login(settings.password, "/__preview/login?next=%2Fgallery%3Ftest%3D1");
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), `${origin}/gallery?test=1`);
  const cookie = response.cookies.get("preview-access");
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.secure, true);
  assert.equal(cookie.sameSite, "lax");
  assert.equal(cookie.path, "/");
  assert.ok(!cookie.value.includes(settings.password));
  const allowed = await previewAccess(request("/red-game/final/music.m4a", {
    headers: { cookie: `preview-access=${cookie.value}` },
  }), settings);
  assert.equal(allowed.headers.get("x-middleware-next"), "1");
  assert.equal(allowed.headers.get("vercel-cdn-cache-control"), "no-store");
});

test("rejects forged, expired, and password-rotated cookies", async (t) => {
  const response = await login();
  const token = response.cookies.get("preview-access").value;
  const withCookie = (value) => request("/", { headers: { cookie: `preview-access=${value}` } });
  for (const forged of ["yes", `${token}x`, `9999999999.${token.split(".").slice(1).join(".")}`]) {
    assert.equal((await previewAccess(withCookie(forged), settings)).status, 303);
  }
  assert.equal((await previewAccess(withCookie(token), { ...settings, password: "changed" })).status, 303);
  const afterExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000;
  t.mock.method(Date, "now", () => afterExpiry);
  assert.equal((await previewAccess(withCookie(token), settings)).status, 303);
});

test("rejects cross-site form posts and unsafe return URLs", async () => {
  const crossSite = await previewAccess(request("/__preview/login", {
    method: "POST",
    headers: { origin: "https://other.example" },
    body: new URLSearchParams({ password: settings.password }),
  }), settings);
  assert.equal(crossSite.status, 403);
  for (const next of ["https://other.example", "//other.example", "/\\other.example", "/__preview/login", "/\r\nother"]) {
    const response = await login(settings.password, `/__preview/login?next=${encodeURIComponent(next)}`);
    assert.equal(response.headers.get("location"), `${origin}/`);
  }
});

test("is disabled without a password and on Vercel production", async () => {
  for (const config of [{}, { ...settings, environment: "production" }]) {
    const response = await previewAccess(request("/"), config);
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.equal(response.headers.get("cache-control"), null);
  }
});
