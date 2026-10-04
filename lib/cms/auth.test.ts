import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { createSession } from "../preview-access.ts";
import { ADMIN_COOKIE, createAdminSession, isAdmin } from "./auth.ts";

process.env.ADMIN_PASSWORD = "test-password";

const request = (headers: Record<string, string> = {}) =>
  new NextRequest("https://site.example/api/pages/comics", { headers });

test("accepts the password as a bearer token", () => {
  assert.equal(isAdmin(request({ authorization: "Bearer test-password" })), true);
});

test("rejects a missing, wrong or malformed password", () => {
  assert.equal(isAdmin(request()), false);
  assert.equal(isAdmin(request({ authorization: "Bearer wrong" })), false);
  assert.equal(isAdmin(request({ authorization: "test-password" })), false);
  assert.equal(isAdmin(request({ authorization: "Bearer " })), false);
});

test("accepts the admin session cookie", () => {
  const cookie = `${ADMIN_COOKIE}=${createAdminSession()}`;
  assert.equal(isAdmin(request({ cookie })), true);
});

test("rejects a preview session, even when the passwords match", () => {
  const cookie = `${ADMIN_COOKIE}=${createSession("test-password")}`;
  assert.equal(isAdmin(request({ cookie })), false);
});

test("nobody is admin when no password is configured", () => {
  process.env.ADMIN_PASSWORD = "";
  assert.equal(isAdmin(request({ authorization: "Bearer " })), false);
  assert.equal(isAdmin(request({ authorization: "Bearer test-password" })), false);
  process.env.ADMIN_PASSWORD = "test-password";
});
