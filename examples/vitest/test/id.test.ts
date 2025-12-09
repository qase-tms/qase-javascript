import { describe, test, expect } from 'vitest';
import { addQaseId } from 'vitest-qase-reporter/vitest';

describe("Example: id.test.ts", () => {
  // Please, change the Id from `1` to any case Id present in your project before uncommenting the test.
  test(addQaseId("A test with Qase Id", [1]), () => {
    expect(true).toBe(true);
  });
});
