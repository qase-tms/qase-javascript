import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe("Example: attach.test.ts", () => {
  test("Test result with attachment", withQase(async ({ qase }) => {

    // To attach a single file
    await qase.attach({
      paths: ["./test/attachments/test-file.txt"],
    });

    /*
     // Add multiple attachments.
    await qase.attach({ paths: ['/path/to/file', '/path/to/another/file'] });

    */
    // Upload file's contents directly from code.
    await qase.attach({
      name: "attachment.txt",
      content: "Hello, world!",
      contentType: "text/plain",
    });

    expect(true).toBe(true);
  }));
});
