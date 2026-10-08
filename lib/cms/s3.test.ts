import assert from "node:assert/strict";
import test from "node:test";
import { PART_SIZE, createUpload, presign } from "./s3.ts";

// The signature here was produced by the spike script and accepted by Bunny,
// so this catches any change to the signing that would be refused upstream.
test("presign matches a signature Bunny accepted", () => {
  const url = presign(
    {
      method: "PUT",
      key: "lil-darkie/files/a b.zip",
      query: { partNumber: "1", uploadId: "abc" },
      now: new Date("2026-10-08T12:00:00Z"),
    },
    "test-password",
  );
  assert.equal(
    url,
    "https://ny-s3.storage.bunnycdn.com/wes-s3/lil-darkie/files/a%20b.zip" +
      "?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=wes-s3%2F20261008%2Fny%2Fs3%2Faws4_request" +
      "&X-Amz-Date=20261008T120000Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&partNumber=1&uploadId=abc" +
      "&X-Amz-Signature=67df07e758e875e043da11fe3033478cc4a350cac85fa3301795d07fcc4ee586",
  );
});

test("createUpload signs one part per 8 MB and fixes the content type", async (t) => {
  process.env.BUNNY_S3_PASSWORD = "test-password";
  const calls: { url: string; init?: RequestInit }[] = [];
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response("<r><UploadId>xyz</UploadId></r>", { status: 200 });
  });

  const upload = await createUpload("Red (The Album).zip", PART_SIZE * 2 + 1, "application/zip");

  assert.equal(calls.length, 1);
  assert.match(calls[0]!.url, /\/wes-s3\/lil-darkie\/files\/[a-z0-9]+-red-the-album-\.zip\?.*uploads=/);
  assert.deepEqual(calls[0]!.init?.headers, { "Content-Type": "application/zip" });
  assert.equal(upload.partSize, PART_SIZE);
  assert.equal(upload.parts.length, 3);
  assert.match(upload.parts[2]!, /partNumber=3&uploadId=xyz/);
  assert.match(upload.complete, /\?.*uploadId=xyz&X-Amz-Signature=/);
  assert.match(upload.abort, /uploadId=xyz/);
  assert.match(upload.url, /^https:\/\/w-s3\.b-cdn\.net\/lil-darkie\/files\/[a-z0-9]+-red-the-album-\.zip$/);
});
