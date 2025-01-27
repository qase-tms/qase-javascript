import { test, expect } from "@playwright/test";
import { qase } from "playwright-qase-reporter";

test.describe("Example: attach.spec.js", () => {
  test("Test result with attachment", async () => {
    // To attach a single file
    qase.attach({ paths: "./tests/examples/attachments/test-file.txt" });

    /* 
     // Add multiple attachments. 
  qase.attach({ paths: ['/path/to/file', '/path/to/another/file'] });

     // Upload file's contents directly from code.
  qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
    */

    expect(true).toBe(true);
  });
});
