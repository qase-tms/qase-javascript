const { qase } = require("jest-qase-reporter/jest");

describe("Example: attach.test.js", () => {
  test("Test result with attachment", async () => {
    /*
    // To attach a single file
    await qase.attach({
      paths: "./attachments/test-file.txt",
    });

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
  });
});
