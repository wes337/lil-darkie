import assert from "node:assert/strict";
import test from "node:test";
import { signUrl } from "./signed-downloads.ts";

// Bunny hashes the decoded path, while the link itself stays encoded. The
// live pull zone refused links signed any other way when this was written.
test("signs the decoded path and keeps the link encoded", () => {
  assert.equal(
    signUrl("https://example.b-cdn.net/a folder/red (the album).zip", 1700000000, "test-key"),
    "https://example.b-cdn.net/a%20folder/red%20(the%20album).zip" +
      "?token=HS256-J3ai3I_ryZmwxJxWiR2PBu1dH8y3_l4z7iotry5rMK4&expires=1700000000",
  );
});
