# Qase Syntax

> [**Click here**](../../examples/playwright/test/) to view Example tests for the following syntax.

Here is the complete list of syntax options available for the reporter:
- [Qase Id](#qase-id)
- [Qase Title](#qase-title)
- [Steps](#steps)
- [Fields](#fields)
- [Suite](#suite)
- [Parameters](#parameters)
- [Comment](#comment)
- [Attach](#attach)
- [Ignore](#ignore)

If you do not use any Qase syntax, the reporter uses the title from the `describe` and `test` functions as the Suite and Test case title respectively, when publishing results.

<br>

### Import Statement
---
Add the following statement at the beginning of your spec file, before any tests.

```javascript
import { qase } from 'playwright-qase-reporter';
```
<br>

### Example Spec file
---
```javascript
import { qase } from 'playwright-qase-reporter';

describe('Suite title', () => {

  test(qase(1, "This is the test name"), () => {
    qase.title("This overrides the test name");
    qase.suite("Suite name");
    qase.fields({ 'severity': 'high', 'priority': 'medium' });
    qase.attach({ paths: './tests/examples/attachments/test-file.txt' });
    qase.comment("A comment for this result");
    qase.ignore(); // doesn't report his result to Qase.
    qase.parameters({ Username: "@test" }); 
    qase.groupParameters({ Username: username, Password: "123" });
    await test.step('Test step title', async () => // step logic });
  });

```
<br>

### Qase ID
---

Qase IDs can be defined using two different methods. It is best to select one method and consistently use it throughout your tests. The first method is recommended.

Only one Qase Id can be linked to a test. 

**Inline with the `test` Function**: 

```javascript
test(qase(1, 'A simple test'), () => {
    ..
```

**Inside the `test` Body**: 

```javascript
test('A simple test', () => {
    qase.id(1);
    // Test logic here
});
```

**In the test's annotations**:

```js
test('A simple test',
{
  annotation: { type: 'QaseID', description: '1' },
},
  async () => {
    // Test logic here
});
```
<br>

### Qase Title
--- 

The `qase.title()` method is used to set the title of a test case, both when creating a new test case from the result, and when updating the title of an existing test case - *if used with `qase.id()`.*

```javascript
test("This won't appear in Qase", () => {
  qase.title("This text will be the title of the test, in Qase");
  // Test logic here
});
```

If you don’t explicitly set a title using this method, the title specified in the `test(..)` function will be used for creating new test cases. However, if this method is defined, it always takes precedence and overrides the title from the `test(..)` function.

<br>

### Steps
--- 

The reporter uses the title from the `test.step` function as the step title. By providing clear and descriptive step names, you make it easier to understand the test’s flow when reviewing the test case.

Additionally, these steps get their own result in the Qase Test run, offering a well-organized summary of the test flow. This helps quickly identify the cause of any failures.

```javascript
test('A Test case with steps, updated from code', async () => {
  await test.step('Initialize the environment', async () => {
    // Set up test environment
  });
  await test.step('Test Core Functionality of the app', async () => {
    // Exercise core functionality
  });

  await test.step('Verify Expected Behavior of the app', async () => {
    // Assert expected behavior
  });
});
```

You also can use the `qase.step()` method to set the expected result and data of the step, which will be used in the Qase report.

```javascript
test('A Test case with steps, updated from code', async () => {
  await test.step(qase.step('Initialize the environment'), async () => {
    // Set up test environment
  });
  await test.step(qase.step('Test Core Functionality of the app', 'expected result'), async () => {
    // Exercise core functionality
  });

  await test.step(qase.step('Verify Expected Behavior of the app', 'expected result', 'data'), async () => {
    // Assert expected behavior
  });
});
```

<br>

### Fields
---

You can define the `description`, `pre-conditions`, `post-conditions`, and fields such as `severity`, `priority`, and `layer` using this method, which enables you to specify and maintain the context of the case directly within your code.

```javascript
test('Maintain your test meta-data from code', async () => {
  qase.fields({
      severity: 'high',
      priority: 'medium',
      layer: 'api',
      precondition: 'add your precondition'
      postcondition: 'add your postcondition'
      description: `Code it quick, fix it slow,
                    Tech debt grows where shortcuts go,
                    Refactor later? Ha! We know.`
    })
    //  test logic here
});
```

<br>


### Suite 
---

You can use this method to nest the resulting test cases in a particular suite. There's something to note here – suites, unlike test cases, are not identified uniquely by the Reporter. Therefore, when defining an existing suite - the title of the suite is used for matching.

```js
test("Test with a defined suite", () => {
  qase.suite("Suite defined with qase.suite()");
    /*
     *  Or, nest multiple levels of suites. 
     *  `\t` is used for dividing each suite name.
     */
     
test("Test with a nested suite", () => {
  qase.suite("Application\tAuthentication\tLogin\tEdge_case");
  //  test logic here
});
```
<br>

### Parameters
---
Parameters are a great way to make your tests more dynamic, reusable, and data-driven. By defining parameters in this method, you can ensure only one test case with all the parameters is created in your Qase project, avoiding duplication.


```javascript
const testCases = [
  { browser: "Chromium", username: "@alice", password: "123" },
  { browser: "Firefox", username: "@bob", password: "456" },
  { browser: "Webkit", username: "@charlie", password: "789" },
];

testCases.forEach(({ browser, username, password,  }) => {
  test(`Test login with ${browser}`, async () => {
    qase.title("Verify if page loads on all browsers");

    qase.parameters({ Browser: browser });  // Single parameter
  // test logic

testCases.forEach(({ username, password }) => {
  test(`Test login with ${username} using qase.groupParameters`, () => {
    qase.title("Verify if user is able to login with their username.");

    qase.groupParameters({  // Group parameters
      Username: username,
      Password: password,
    });
  // test logic
```
<br>

### Comment
---
In addition to `test.step()`, this method can be used to provide any additional context to your test, it helps maintiain the code by clarifying the expected result of the test.

```js
test("A test case with qase.comment()", () => {
    /*
     * Please note, this comment is added to a Result, not to the Test case.
     */
  qase.comment("This comment is added to the result");
  // test logic here
});
```
<br>

### Attach
---
This method can help attach one, or more files to the test's result. You can also add the file's contents directly from code. For example: 

```js
test('Test result with attachment', async () => {

       // To attach a single file
    qase.attach({
      paths: "./tests/examples/attachments/test-file.txt",
    });

       // Add multiple attachments. 
    qase.attach({ paths: ['/path/to/file', '/path/to/another/file'] });


       // Upload file's contents directly from code.
    qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
      // test logic here
});
```
<br>

### Ignore
---
If this method is added, the reporter will exclude the test’s result from the report sent to Qase. While the test will still executed by Playwright, its result will not be considered by the reporter.

```js
test("This test is executed using Playwright; however, it is NOT reported to Qase", () => {
  qase.ignore();
//  test logic here
```
