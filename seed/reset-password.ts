// Forgets the admin password saved in the database, which puts the
// ADMIN_PASSWORD env var back in charge. Use it when the password is lost.
//
//   node --env-file=.env.local seed/reset-password.ts <dev|prod>
import { redis } from "../lib/cms/store.ts";

const [namespace] = process.argv.slice(2);
if (namespace !== "dev" && namespace !== "prod") {
  throw new Error("Usage: reset-password.ts <dev|prod>");
}
const removed = await (await redis()).del(`${namespace}:admin-password`);
console.log(removed ? "Saved password removed. ADMIN_PASSWORD is the password again." : "No saved password.");
(await redis()).destroy();
