const { qase } = require("jest-qase-reporter/jest");
const { markdownContent } = require("./markdownContent");

describe("Example: fields.test.js\tTest cases with field: Priority", () => {
  /*
   * Meta data such as Priority, Severity, Layer fields, Description, and  pre-conditions can be updated from code.
   * This enables you to manage test cases from code directly.
   */

  test("Priority = low", async () => {
    await qase.fields({ priority: "low" });
    expect(true).toBe(true);
  });

  test("Priority = medium", async () => {
    await qase.fields({ priority: "medium" });
    expect(true).toBe(true);
  });

  test("Priority = high", async () => {
    await qase.fields({ priority: "high" });
    expect(true).toBe(true);
  });
});

describe("Example: fields.test.js\tTest cases with field: Severity", () => {
  test("Severity = trivial", async () => {
    await qase.fields({ severity: "trivial" });
    expect(true).toBe(true);
  });

  test("Severity = minor", async () => {
    await qase.fields({ severity: "minor" });
    expect(true).toBe(true);
  });

  test("Severity = normal", async () => {
    await qase.fields({ severity: "normal" });
    expect(true).toBe(true);
  });

  test("Severity = major", async () => {
    await qase.fields({ severity: "major" });
    expect(true).toBe(true);
  });

  test("Severity = critical", async () => {
    await qase.fields({ severity: "critical" });
    expect(true).toBe(true);
  });

  test("Severity = blocker", async () => {
    await qase.fields({ severity: "blocker" });
    expect(true).toBe(true);
  });
});

describe("Example: fields.test.js\tTest cases with field: Layer", () => {
  test("Layer = e2e", async () => {
    await qase.fields({ layer: "e2e" });
    expect(true).toBe(true);
  });

  test("Layer = api", async () => {
    await qase.fields({ layer: "api" });
    expect(true).toBe(true);
  });

  test("Layer = unit", async () => {
    await qase.fields({ layer: "unit" });
    expect(true).toBe(true);
  });
});

describe("Example: fields.test.js\tTest cases with Description, Pre & Post Conditions", () => {
  test("Description with Markdown Support", async () => {
    await qase.fields({ description: markdownContent });
    expect(true).toBe(true);
  });

  test("Preconditions with Markdown Support", async () => {
    await qase.fields({ preconditions: markdownContent });
    expect(true).toBe(true);
  });

  test("Postconditions with Markdown Support", async () => {
    await qase.fields({ postconditions: markdownContent });
    expect(true).toBe(true);
  });
});
