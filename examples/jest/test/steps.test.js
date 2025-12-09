const { qase } = require("jest-qase-reporter/jest");
const {describe, test, expect} = require("@jest/globals");

describe("Example: steps.test.js", () => {
  test("A Test case with steps, updated from code", async () => {
    await qase.step("Initialize the environment", async () => {
      // Set up test environment
    });

    await qase.step("Test Core Functionality of the app", async () => {
      // Exercise core functionality
    });

    await qase.step("Verify Expected Behavior of the app", async () => {
      // Assert expected behavior
    });

    await qase.step(
      "Verify if user is able to log out successfully",
      async () => {
        // Expected user to be logged out (but, ran into a problem!).
        expect(true).toBe(true);
      },
    );
  });

  test("A Test case with steps including expected results and data", async () => {
    await qase.step("Click button", async () => {
      // Click action
    }, "Button should be clicked", "Button data");

    await qase.step("Fill form", async () => {
      // Form filling action
    }, "Form should be filled", "Form input data");

    await qase.step("Submit form", async () => {
      // Submit action
    }, "Form should be submitted", "Form submission data");
  });
});
