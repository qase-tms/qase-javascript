import { describe, test, expect } from 'vitest';
import { qase, withQase } from 'vitest-qase-reporter/vitest';

describe("Example: id.test.ts", () => {
  // Please, change the Id from `1` to any case Id present in your project before uncommenting the test.
  test(qase(1, "A test with Qase Id"), () => {
    expect(true).toBe(true);
  });
});
