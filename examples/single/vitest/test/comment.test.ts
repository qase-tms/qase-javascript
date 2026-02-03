import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe("Example: comment.test.ts", () => {
  test("A test case with qase.comment()", withQase(async ({ qase }) => {
    /*
     * Please note, this comment is added to a Result, not to the Test case.
     */

    await qase.comment(
      "This comment will be displayed in the 'Actual Result' field of the test result in Qase.",
    );

    expect(true).toBe(true);
  }));
});
