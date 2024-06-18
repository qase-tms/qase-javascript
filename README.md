# [Qase TestOps](https://qase.io) reporters for JavaScript

Monorepo with [Qase TestOps](https://qase.io) reporters for JavaScript testing frameworks.

For all of our reporters, there are two versions:

* The latest v2 series, either already released or in the beta stage.
* The v1 series, stable and receiving only bugfixes.

If you're just starting, pick v2.
If your project is using a v1 reporter, check out the reporter's readme for the migration guide.

| Name                          | Package name               | v2 series                                                                                          | v1 series                                                                                      |
|:------------------------------|:---------------------------|:---------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------|
| **Qase JavaScript Reporters** |
| CucumberJS                    | `cucumberjs-qase-reporter` | [✅ released](https://github.com/qase-tms/qase-javascript/tree/main/qase-cucumberjs#readme)         | [🗿deprecated](https://github.com/qase-tms/qase-javascript/tree/master/qase-cucumberjs#readme) |
| Cypress                       | `cypress-qase-reporter`    | [✅ released](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress#readme)            | [🗿deprecated](https://github.com/qase-tms/qase-javascript/tree/master/qase-cypress#readme)    |
| Jest                          | `jest-qase-reporter`       | [✅ released](https://github.com/qase-tms/qase-javascript/tree/main/qase-jest#readme)               | [🗿deprecated](https://github.com/qase-tms/qase-javascript/tree/master/qase-jest#readme)       |
| Newman                        | `newman-reporter-qase`     | [✅ released](https://github.com/qase-tms/qase-javascript/tree/main/qase-newman#readme)             | [🗿deprecated](https://github.com/qase-tms/qase-javascript/tree/master/qase-newman#readme)     |
| Playwright                    | `playwright-qase-reporter` | [✅ released](https://github.com/qase-tms/qase-javascript/tree/main/qase-playwright#readme)         | [🗿deprecated](https://github.com/qase-tms/qase-javascript/tree/master/qase-playwright#readme) |
| Testcafe                      | `testcafe-reporter-qase`   | [✅ released](https://github.com/qase-tms/qase-javascript/tree/main/qase-testcafe#readme)           | [🗿deprecated](https://github.com/qase-tms/qase-javascript/tree/master/qase-testcafe#readme)       |
| **Qase JavaScript SDK**       |
| Common functions library      | `qase-javascript-commons`  | [✅ released](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#readme) | not available                                                                                  |
| JavaScript API client         | `qaseio`                   | [✅ released](https://github.com/qase-tms/qase-javascript/tree/main/qaseio#readme)                  | [🗿deprecated](https://github.com/qase-tms/qase-javascript/tree/master/qaseio#readme)          |

What each status means:

* The "✅ released" reporters are stable and well-tested versions.
  They will receive more new features as well as bugfixes, should we find bugs.

* The "🧪 open beta" reporters are in active development and rigorous testing.
  It's completely usable (and much more fun to use than v1), but there can be some bugs and minor syntax changes.
  When starting a new test project, the "🧪 open beta" versions are the recommended choice.
  For existing projects, we recommend planning a migration — see the migration section in each
  reporter's readme and try out the new features.

* The "🧰 closed beta" reporters are in active development, and
  can still have major bugs and future syntax changes.
  However, we encourage experimenting with them.
  Your feedback is always welcome.

* The v1 series reporters in the "🗿stable" or "🗿deprecated" status only get some fixes, but no new features.
