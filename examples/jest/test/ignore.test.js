const { qase } = require("jest-qase-reporter/jest");
const {describe, test, expect} = require("@jest/globals");

describe("Example: ignore.test.js", () => {
  test("This test is executed using Jest; however, it is NOT reported to Qase", () => {
    qase.ignore();
    expect(true).toBe(true);
  });
});
