import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';
import { markdownContent } from './markdownContent';

describe("Example: fields.test.ts\tTest cases with field: Priority", () => {
  /*
   * Meta data such as Priority, Severity, Layer fields, Description, and  pre-conditions can be updated from code.
   * This enables you to manage test cases from code directly.
   */

  test("Priority = low", withQase(async ({ qase }) => {
    await qase.fields({ priority: "low" });
    expect(true).toBe(true);
  }));

  test("Priority = medium", withQase(async ({ qase }) => {
    await qase.fields({ priority: "medium" });
    expect(true).toBe(true);
  }));

  test("Priority = high", withQase(async ({ qase }) => {
    await qase.fields({ priority: "high" });
    expect(true).toBe(true);
  }));
});

describe("Example: fields.test.ts\tTest cases with field: Severity", () => {
  test("Severity = trivial", withQase(async ({ qase }) => {
    await qase.fields({ severity: "trivial" });
    expect(true).toBe(true);
  }));

  test("Severity = minor", withQase(async ({ qase }) => {
    await qase.fields({ severity: "minor" });
    expect(true).toBe(true);
  }));

  test("Severity = normal", withQase(async ({ qase }) => {
    await qase.fields({ severity: "normal" });
    expect(true).toBe(true);
  }));

  test("Severity = major", withQase(async ({ qase }) => {
    await qase.fields({ severity: "major" });
    expect(true).toBe(true);
  }));

  test("Severity = critical", withQase(async ({ qase }) => {
    await qase.fields({ severity: "critical" });
    expect(true).toBe(true);
  }));

  test("Severity = blocker", withQase(async ({ qase }) => {
    await qase.fields({ severity: "blocker" });
    expect(true).toBe(true);
  }));
});

describe("Example: fields.test.ts\tTest cases with field: Layer", () => {
  test("Layer = e2e", withQase(async ({ qase }) => {
    await qase.fields({ layer: "e2e" });
    expect(true).toBe(true);
  }));

  test("Layer = api", withQase(async ({ qase }) => {
    await qase.fields({ layer: "api" });
    expect(true).toBe(true);
  }));

  test("Layer = unit", withQase(async ({ qase }) => {
    await qase.fields({ layer: "unit" });
    expect(true).toBe(true);
  }));
});

describe("Example: fields.test.ts\tTest cases with Description, Pre & Post Conditions", () => {
  test("Description with Markdown Support", withQase(async ({ qase }) => {
    await qase.fields({ description: markdownContent });
    expect(true).toBe(true);
  }));

  test("Preconditions with Markdown Support", withQase(async ({ qase }) => {
    await qase.fields({ preconditions: markdownContent });
    expect(true).toBe(true);
  }));

  test("Postconditions with Markdown Support", withQase(async ({ qase }) => {
    await qase.fields({ postconditions: markdownContent });
    expect(true).toBe(true);
  }));
});
