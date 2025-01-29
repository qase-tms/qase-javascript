const { qase } = require("jest-qase-reporter/jest");

describe("Example: suite.test.js", () => {
  test("Test with a defined suite", () => {
    qase.suite("Example: suite.test.js\tThis shall be a suite name");
    expect(true).toBe(true);
  });

  test("Test within multiple levels of suite", () => {
    qase.suite(
      "Example: suite.test.js\tThis shall be a suite name\tChild Suite",
    );
    // A `\t` is used for dividing each suite name
    expect(true).toBe(true);
  });
});
