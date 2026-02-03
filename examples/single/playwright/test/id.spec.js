import { test, expect } from "@playwright/test";
import { qase } from "playwright-qase-reporter";


test.describe("Example: id.spec.js", () => {

  test(qase(1, "Defining Id: Format 1"), () => {
    expect(true).toBe(true);
  });


  test("Defining Id: Format 2", () => {
    qase.id(2);
    expect(true).toBe(true);
  });


  test(
    "Defining Id: Format 3",
    {
      annotation: { type: "QaseID", description: "3" },
    },
    async () => {
      expect(true).toBe(true);
    },
  );
});
