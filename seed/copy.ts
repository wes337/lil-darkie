// Copies every site, page and post record from one namespace to another.
// Used on launch day to promote what was built on preview deploys.
//
//   node --env-file=.env.local seed/copy.ts dev prod
//
// Records in the target with the same slug are overwritten. Their old values
// stay in the version history. Records only the target has are left alone.
import { createStore, redis } from "../lib/cms/store.ts";

const [from, to] = process.argv.slice(2);
if (!from || !to || from === to) throw new Error("Usage: copy.ts <from> <to>");

const source = createStore(from);
const target = createStore(to);

await target.saveSite(await source.getSite());
for (const kind of ["page", "post"] as const) {
  for (const doc of await source.list(kind)) {
    await target.save(kind, doc.slug, doc);
    console.log(`copied ${kind} ${doc.slug}`);
  }
}
(await redis()).destroy();
