import assert from "node:assert/strict";
import test from "node:test";
import { uploadFile } from "./upload.ts";

type Call = { url: string; method: string; body?: unknown };

// A fetch that plays the part of the upload route and of storage. `parts`
// says how each part PUT answers, by part number, in order of attempts.
function fakeFetch(calls: Call[], parts: Record<number, number[]>) {
  const attempts: Record<number, number> = {};
  return async (url: string | URL | Request, init?: RequestInit) => {
    const target = String(url);
    calls.push({ url: target, method: init?.method ?? "GET", body: init?.body });
    if (target === "/api/uploads") {
      return Response.json({
        url: "https://cdn/x.bin",
        partSize: 4,
        parts: ["https://s3/x?partNumber=1", "https://s3/x?partNumber=2", "https://s3/x?partNumber=3"],
        complete: "https://s3/x?complete",
        abort: "https://s3/x?abort",
      });
    }
    const part = Number(/partNumber=(\d)/.exec(target)?.[1]);
    if (part) {
      const attempt = (attempts[part] = (attempts[part] ?? 0) + 1);
      const status = parts[part]?.[attempt - 1] ?? 200;
      return new Response(null, { status, headers: status === 200 ? { ETag: `"etag-${part}"` } : {} });
    }
    return new Response(null, { status: 204 });
  };
}

const file = () => new File(["0123456789"], "x.bin");

test("parts go up in order of ETag and the complete step lists them", async (t) => {
  const calls: Call[] = [];
  t.mock.method(globalThis, "fetch", fakeFetch(calls, { 2: [500] }));
  const progress: number[] = [];

  const result = await uploadFile(file(), (fraction) => progress.push(fraction));

  assert.deepEqual(result, { url: "https://cdn/x.bin", size: 10 });
  assert.equal(progress.at(-1), 1);
  // Part 2 failed once and was sent again.
  assert.equal(calls.filter((call) => call.url.includes("partNumber=2")).length, 2);
  const complete = calls.find((call) => call.url.endsWith("complete"));
  assert.equal(
    complete?.body,
    "<CompleteMultipartUpload>" +
      '<Part><PartNumber>1</PartNumber><ETag>"etag-1"</ETag></Part>' +
      '<Part><PartNumber>2</PartNumber><ETag>"etag-2"</ETag></Part>' +
      '<Part><PartNumber>3</PartNumber><ETag>"etag-3"</ETag></Part>' +
      "</CompleteMultipartUpload>",
  );
  assert.equal(calls.some((call) => call.url.endsWith("abort")), false);
});

test("a part that fails twice abandons the upload", async (t) => {
  const calls: Call[] = [];
  t.mock.method(globalThis, "fetch", fakeFetch(calls, { 1: [500, 500] }));

  await assert.rejects(uploadFile(file(), () => {}), /Part upload failed \(500\)/);

  assert.equal(calls.some((call) => call.url.endsWith("complete")), false);
  assert.equal(calls.filter((call) => call.url.endsWith("abort")).length, 1);
});

test("the route's refusal is the error shown", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ error: "Invalid upload" }, { status: 400 }),
  );
  await assert.rejects(uploadFile(file(), () => {}), /Invalid upload/);
});
