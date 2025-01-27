import { test, expect } from "@playwright/test";
import { qase } from "playwright-qase-reporter";
import { markdownContent } from "./markdownContent";

test.describe("Example: fields.spec.js\tTest cases with field: Priority", () => {
  /*
   * Meta data such as Priority, Severity, Layer fields, Description, and  pre-conditions can be updated from code.
   * This enables you to manage test cases from code directly.
   */

  test("Priority = low", () => {
    qase.fields({ priority: "low" });
    expect(true).toBe(true);
  });

  test("Priority = medium", () => {
    qase.fields({ priority: "medium" });
    expect(true).toBe(true);
  });

  test("Priority = high", () => {
    qase.fields({ priority: "high" });
    expect(true).toBe(true);
  });
});

test.describe("Example: fields.spec.js\tTest cases with field: Severity", () => {
  test("Severity = trivial", () => {
    qase.fields({ severity: "trivial" });
    expect(true).toBe(true);
  });

  test("Severity = minor", () => {
    qase.fields({ severity: "minor" });
    expect(true).toBe(true);
  });

  test("Severity = normal", () => {
    qase.fields({ severity: "normal" });
    expect(true).toBe(true);
  });

  test("Severity = major", () => {
    qase.fields({ severity: "major" });
    expect(true).toBe(true);
  });

  test("Severity = critical", () => {
    qase.fields({ severity: "critical" });
    expect(true).toBe(true);
  });

  test("Severity = blocker", () => {
    qase.fields({ severity: "blocker" });
    expect(true).toBe(true);
  });
});

test.describe("Example: fields.spec.js\tTest cases with field: Layer", () => {
  test("Layer = e2e", () => {
    qase.fields({ layer: "e2e" });
    expect(true).toBe(true);
  });

  test("Layer = api", () => {
    qase.fields({ layer: "api" });
    expect(true).toBe(true);
  });

  test("Layer = unit", () => {
    qase.fields({ layer: "unit" });
    expect(true).toBe(true);
  });
});

test.describe("Example: fields.spec.js\tTest cases with Description, Pre & Post Conditions", () => {
  test("Description with Markdown Support", () => {
    qase.fields({ description: markdownContent });
    expect(true).toBe(true);
  });

  test("Preconditions with Markdown Support", () => {
    qase.fields({ preconditions: markdownContent });
    expect(true).toBe(true);
  });

  test("Postconditions with Markdown Support", () => {
    qase.fields({ postconditions: markdownContent });
    expect(true).toBe(true);
  });
});
