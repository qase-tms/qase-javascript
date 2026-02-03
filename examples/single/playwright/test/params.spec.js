import { test, expect } from "@playwright/test";
import { qase } from "playwright-qase-reporter";

const testCases = [
  { browser: "Chromium", username: "@alice", password: "123" },
  { browser: "Firefox", username: "@bob", password: "456" },
  { browser: "Webkit", username: "@charlie", password: "789" },
];

test.describe("Example param.cy.js\tSingle Parameter", () => {
  testCases.forEach(({ browser }) => {
    test(`Test login with ${browser}`, () => {
      qase.title("Verify if login page loads successfully");

      /*
       * Instead of creating three separate test cases in Qase, this method will add a 'browser' parameter, with three values.
       */

      qase.parameters({ Browser: browser });

      expect(true).toBe(true);
    });
  });
});

test.describe("Example param.cy.js\tGroup Parameter", () => {
  testCases.forEach(({ username, password }) => {
    test(`Test login with ${username} using qase.groupParameters`, () => {
      qase.title("Verify if user is able to login with their username.");

      /*
       * Here, we're grouping the username and password parameters to track them together, as a set of parameters for the test.
       * This will show the username and password combinations for the test.
       */

      qase.groupParameters({
        Username: username,
        Password: password,
      });

      expect(true).toBe(true);
    });
  });
});
