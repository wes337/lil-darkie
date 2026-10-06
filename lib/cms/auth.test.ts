import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { createSession } from "../preview-access.ts";
import { ADMIN_COOKIE, createAuth, hashPassword } from "./auth.ts";

process.env.ADMIN_PASSWORD = "env-password";

const request = (headers: Record<string, string> = {}) =>
  new NextRequest("https://site.example/api/pages/comics", { headers });
const bearer = (password: string) => request({ authorization: `Bearer ${password}` });

// No password saved in the database: the env var is the password.
const envOnly = createAuth(async () => null);
// A password changed in the admin.
const changed = createAuth(async () => STORED);
const STORED = hashPassword("new-password");

test("accepts the env password as a bearer token", async () => {
  assert.equal(await envOnly.isAdmin(bearer("env-password")), true);
});

test("rejects a missing, wrong or malformed password", async () => {
  assert.equal(await envOnly.isAdmin(request()), false);
  assert.equal(await envOnly.isAdmin(bearer("wrong")), false);
  assert.equal(await envOnly.isAdmin(request({ authorization: "env-password" })), false);
  assert.equal(await envOnly.isAdmin(request({ authorization: "Bearer " })), false);
});

test("accepts the admin session cookie", async () => {
  const cookie = `${ADMIN_COOKIE}=${await envOnly.createAdminSession()}`;
  assert.equal(await envOnly.isAdmin(request({ cookie })), true);
});

test("rejects a preview session, even when the passwords match", async () => {
  const cookie = `${ADMIN_COOKIE}=${createSession("env-password")}`;
  assert.equal(await envOnly.isAdmin(request({ cookie })), false);
});

test("nobody is admin when no password is configured anywhere", async () => {
  process.env.ADMIN_PASSWORD = "";
  assert.equal(await envOnly.isAdmin(request({ authorization: "Bearer " })), false);
  assert.equal(await envOnly.isAdmin(bearer("env-password")), false);
  process.env.ADMIN_PASSWORD = "env-password";
});

test("a saved password replaces the env password", async () => {
  assert.equal(await changed.isAdmin(bearer("new-password")), true);
  assert.equal(await changed.isAdmin(bearer("env-password")), false);
  assert.equal(await changed.isAdmin(bearer("wrong")), false);
});

test("changing the password ends sessions made before it", async () => {
  const before = `${ADMIN_COOKIE}=${await envOnly.createAdminSession()}`;
  const after = `${ADMIN_COOKIE}=${await changed.createAdminSession()}`;
  assert.equal(await changed.isAdmin(request({ cookie: before })), false);
  assert.equal(await changed.isAdmin(request({ cookie: after })), true);
});

test("the same password hashes differently each time", () => {
  assert.notEqual(hashPassword("new-password"), hashPassword("new-password"));
});
