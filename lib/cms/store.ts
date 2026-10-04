import { createClient } from "redis";
import { DEFAULT_SITE, SCHEMAS, type Doc, type Kind } from "./schema.ts";

const VERSIONS_KEPT = 10;

export type Version<K extends Kind> = { savedAt: string; data: Doc<K> };

// One Redis database serves every environment, so keys carry a namespace.
// Only the production deploy reads and writes `prod`.
export const DEFAULT_NAMESPACE =
  process.env.VERCEL_ENV === "production" ? "prod" : "dev";

const connect = () =>
  createClient({ url: process.env.REDIS_URL })
    .on("error", (error) => console.error("Redis error", error))
    .connect();
let connection: ReturnType<typeof connect> | undefined;

// Shared across requests in the same server instance.
export const redis = () => (connection ??= connect());

// Reads and writes site, page and post records. `site` is a single record;
// pages and posts live in one hash each, keyed by slug. Every save also lands
// in a capped version list so it can be restored.
export function createStore(namespace: string = DEFAULT_NAMESPACE) {
  const hashKey = (kind: Kind) => `${namespace}:${kind}s`;
  const versionsKey = (kind: Kind, slug: string) =>
    `${namespace}:versions:${kind}:${slug}`;

  async function get<K extends Kind>(kind: K, slug: string): Promise<Doc<K> | null> {
    const raw = await (await redis()).hGet(hashKey(kind), slug);
    return raw ? (JSON.parse(raw) as Doc<K>) : null;
  }

  async function list<K extends Kind>(kind: K): Promise<Doc<K>[]> {
    const raw = await (await redis()).hVals(hashKey(kind));
    return raw.map((value) => JSON.parse(value) as Doc<K>);
  }

  // Validates before writing. Throws a ZodError on bad input.
  async function save<K extends Kind>(kind: K, slug: string, input: unknown): Promise<Doc<K>> {
    const data = SCHEMAS[kind].parse(input) as Doc<K>;
    const version: Version<K> = { savedAt: new Date().toISOString(), data };
    await (await redis())
      .multi()
      .hSet(hashKey(kind), slug, JSON.stringify(data))
      .lPush(versionsKey(kind, slug), JSON.stringify(version))
      .lTrim(versionsKey(kind, slug), 0, VERSIONS_KEPT - 1)
      .exec();
    return data;
  }

  // Versions are kept so a deleted record can still be recovered by hand.
  async function remove(kind: Kind, slug: string): Promise<boolean> {
    return (await (await redis()).hDel(hashKey(kind), slug)) > 0;
  }

  // Newest first. The first entry is the current value.
  async function versions<K extends Kind>(kind: K, slug: string): Promise<Version<K>[]> {
    const raw = await (await redis()).lRange(versionsKey(kind, slug), 0, -1);
    return raw.map((value) => JSON.parse(value) as Version<K>);
  }

  return {
    get,
    list,
    save,
    remove,
    versions,
    getSite: async () => (await get("site", "site")) ?? DEFAULT_SITE,
    saveSite: (input: unknown) => save("site", "site", input),
  };
}

export const store = createStore();
