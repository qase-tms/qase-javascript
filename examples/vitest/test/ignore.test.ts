import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe("Example: ignore.test.ts", () => {
  test("This test is executed using Vitest; however, it is NOT reported to Qase", withQase(async ({ qase }) => {
    await qase.ignore();
    expect(true).toBe(true);
  }));
});
