import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe("Example: suite.test.ts", () => {
  test("Test with a defined suite", withQase(async ({ qase }) => {
    await qase.suite("Example: suite.test.ts\tThis shall be a suite name");
    expect(true).toBe(true);
  }));

  test("Test within multiple levels of suite", withQase(async ({ qase }) => {
    await qase.suite(
      "Example: suite.test.ts\tThis shall be a suite name\tChild Suite",
    );
    // A `\t` is used for dividing each suite name
    expect(true).toBe(true);
  }));
});
