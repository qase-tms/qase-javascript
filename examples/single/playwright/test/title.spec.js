import { test, expect } from "@playwright/test";
import { qase } from "playwright-qase-reporter";

test.describe("Example: title.spec.js", () => {
  test("Test without qase.title() method", () => {
    /*
     * Here, we're are not using a qase.title() method
     * Given, you have "Auto-create cases" option enabled for this project.
     * A new test will be created in Qase, with the test's title.
     */

    expect(true).toBe(true);
  });

  test("This won't appear in Qase", () => {
    qase.title("This text will be the title of the test, in Qase");

    /*
     * Here, the Qase Test case's title will be taken from qase.title() method.
     */

    expect(true).toBe(true);
  });
});

/*
 *
 *     Q) What about the tests where the qase.title() method is not used?
 *     =>   Those test cases will have the "Title of this test" as the newly created case's title.
 *
 *
 *     Q) I'm running this test case, but it's not creating any test case in Qase.
 *        My test run is empty, what am I doing wrong?
 *
 *     =>   Go to your Qase Project's settings, switch to the Test runs tab.
 *          Under "Automated Testing" - Enable "Create test cases option" [https://i.imgur.com/PtZPrrY.png]
 *
 *
 *     Q) What happens if I change the title in `qase.title()` ?
 *     =>   Since, there's no link between the Qase test case and this test, changing the title will lead to
 *          a new case being created in your Project repository.
 *
 */
