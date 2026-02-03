import { test, expect } from "@playwright/test";
import { qase } from "playwright-qase-reporter";

test.describe("Example: ignore.spec.js", () => {
  test("This test is executed using Playwright; however, it is NOT reported to Qase", () => {
    qase.ignore();
    expect(true).toBe(true);
  });
});
