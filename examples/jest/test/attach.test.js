const { qase } = require("jest-qase-reporter/jest");
const {describe, test, expect} = require("@jest/globals");

describe("Example: attach.test.js", () => {
  test("Test result with attachment", async () => {

    // To attach a single file
    qase.attach({
      paths: ["./test/attachments/test-file.txt"],
    });

    /*
     // Add multiple attachments.
    await qase.attach({ paths: ['/path/to/file', '/path/to/another/file'] });

    */
    // Upload file's contents directly from code.
    qase.attach({
      name: "attachment.txt",
      content: "Hello, world!",
      contentType: "text/plain",
    });

    expect(true).toBe(true);
  });
});
