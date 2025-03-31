const { qase } = require("jest-qase-reporter/jest");
const {describe, test, expect} = require("@jest/globals");

describe("Example: id.test.js", () => {
  // Please, change the Id from `1` to any case Id present in your project before uncommenting the test.
  test(qase(1, "A test with Qase Id"), () => {
    expect(true).toBe(true);
  });
});
