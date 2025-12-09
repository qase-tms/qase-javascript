# Qase Syntax

> [**Click here**](../../examples/vitest) to view Example tests for the following syntax.

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

If you do not use any Qase syntax, the reporter uses the title from the `describe` and `it`/`test` functions as the Suite and Test case title respectively, when publishing results.

<br>

### Import Statement
---
Add the following statement at the beginning of your spec file, before any tests.

```typescript
import { qase, withQase } from 'vitest-qase-reporter/vitest';
```
<br>

### Qase ID
---

You can link one or more Qase Ids to a test.

```typescript
it(qase(1, "A test with Qase Id"), () => {
    // test logic
});

it(qase(['2', '3'], "A test with multiple Qase Ids"), () => {
    // test logic
});
```

<br>

### Qase Title
--- 

The `qase.title()` method is used to set the title of a test case, both when creating a new test case from the result, and when updating the title of an existing test case - *if used with `qase.id()`.*

```typescript
it("This won't appear in Qase", withQase(async ({ qase }) => {
  await qase.title("This text will be the title of the test, in Qase");
    // Test logic here
}));
```

If you don't explicitly set a title using this method, the title specified in the `it(..)` function will be used for creating new test cases. However, if this method is defined, it always takes precedence and overrides the title from the `it(..)` function.

<br>

### Steps
--- 

The reporter uses the title from the `qase.step` function as the step title. By providing clear and descriptive step names, you make it easier to understand the test's flow when reviewing the test case.

Additionally, these steps get their own result in the Qase Test run, offering a well-organized summary of the test flow. This helps quickly identify the cause of any failures.

You can also provide an expected result and input data for each step, which will be displayed in Qase.

```typescript
it('A Test case with steps, updated from code', withQase(async ({ qase }) => {
  await qase.step('Initialize the environment', async () => {
    // Set up test environment
  });
  await qase.step('Test Core Functionality of the app', async () => {
    // Exercise core functionality
  });

  await qase.step('Verify Expected Behavior of the app', async () => {
    // Assert expected behavior
  });
}));
```

#### Steps with Expected Result and Data

```typescript
it('A Test case with steps including expected results and data', withQase(async ({ qase }) => {
  await qase.step('Click button', async () => {
    // Click action
  }, 'Button should be clicked', 'Button data');
  
  await qase.step('Fill form', async () => {
    // Form filling action
  }, 'Form should be filled', 'Form input data');
}));
```
<br>

### Fields
---

You can define the `description`, `pre-conditions`, `post-conditions`, and fields such as `severity`, `priority`, and `layer` using this method, which enables you to specify and maintain the context of the case directly within your code.

```typescript
it('Maintain your test meta-data from code', withQase(async ({ qase }) => {
  await qase.fields({
    severity: 'high',
    priority: 'medium',
    layer: 'api',
    precondition: 'add your precondition',
    postcondition: 'add your postcondition',
    description: `Code it quick, fix it slow,
                  Tech debt grows where shortcuts go,
                  Refactor later? Ha! We know.`
  });
    //  test logic here
}));
```

<br>


### Suite 
---

You can use this method to nest the resulting test cases in a particular suite. There's something to note here – suites, unlike test cases, are not identified uniquely by the Reporter. Therefore, when defining an existing suite - the title of the suite is used for matching.

```typescript
it("Test with a defined suite", withQase(async ({ qase }) => {
  await qase.suite("Suite defined with qase.suite()");
    /*
     *  Or, nest multiple levels of suites. 
     *  `\t` is used for dividing each suite name.
     */
}));

it("Test with a nested suite", withQase(async ({ qase }) => {
  await qase.suite("Application\tAuthentication\tLogin\tEdge_case");
  //  test logic here
}));
```
<br>

### Parameters
---
Parameters are a great way to make your tests more dynamic, reusable, and data-driven. By defining parameters in this method, you can ensure only one test case with all the parameters is created in your Qase project, avoiding duplication.


```typescript
const testCases = [
  { browser: "Chromium", username: "@alice", password: "123" },
  { browser: "Firefox", username: "@bob", password: "456" },
  { browser: "Webkit", username: "@charlie", password: "789" },
];

testCases.forEach(({ browser, username, password }) => {
  it(`Test login with ${browser}`, withQase(async ({ qase }) => {
    await qase.title("Verify if page loads on all browsers");

    await qase.parameters({ Browser: browser });  // Single parameter
  // test logic
  }));
});

testCases.forEach(({ username, password }) => {
  it(`Test login with ${username} using qase.groupParameters`, withQase(async ({ qase }) => {
    await qase.title("Verify if user is able to login with their username.");

    await qase.groupParameters({  // Group parameters
      Username: username,
      Password: password,
    });
  // test logic
  }));
});
```
<br>

### Comment
---
In addition to `qase.step()`, this method can be used to provide any additional context to your test, it helps maintain the code by clarifying the expected result of the test.

```typescript
it("A test case with qase.comment()", withQase(async ({ qase }) => {
    /*
     * Please note, this comment is added to a Result, not to the Test case.
     */
  await qase.comment("This comment is added to the result");
  // test logic here
}));
```
<br>

### Attach
---
This method can help attach one, or more files to the test's result. You can also add the file's contents directly from code. For example: 

```typescript
it('Test result with attachment', withQase(async ({ qase }) => {
    
    // To attach a single file
  await qase.attach({
    paths: "./attachments/test-file.txt",
  });

    // Add multiple attachments. 
  await qase.attach({ paths: ['/path/to/file', '/path/to/another/file'] });

    // Upload file's contents directly from code.
  await qase.attach({
    name: "attachment.txt",
    content: "Hello, world!",
    type: "text/plain",
  });
    // test logic here
}));
```
<br>

### Ignore
---
If this method is added, the reporter will exclude the test's result from the report sent to Qase. While the test will still be executed by vitest, its result will not be considered by the reporter.

```typescript
it("This test is executed by vitest; however, it is NOT reported to Qase", withQase(async ({ qase }) => {
  await qase.ignore();
//  test logic here
}));
```

### Advanced Usage with Annotations
---

For more complex scenarios, you can combine multiple annotations in a single test:

```typescript
it('Advanced test with multiple annotations', withQase(async ({ qase, annotate }) => {
  // Set test title
  await qase.title('Advanced Test with Multiple Annotations');
  
  // Add comment
  await qase.comment('This test demonstrates advanced qase annotations functionality');
  
  // Set suite
  await qase.suite('Vitest Integration Suite');
  
  // Set fields
  await qase.fields({
    description: 'Test description for Qase',
    severity: 'critical',
    priority: 'high',
    layer: 'e2e'
  });
  
  // Set parameters
  await qase.parameters({
    environment: 'staging',
    browser: 'chrome',
    version: '1.0.0'
  });
  
  // Add steps
  await qase.step('Initialize test data', async () => {
    // Setup logic
  });
  
  await qase.step('Execute main test logic', async () => {
    // Main test logic
  });
  
  // Add attachment with content
  await qase.attach({
    name: 'test-data.json',
    content: JSON.stringify({ test: 'data' }),
    type: 'application/json'
  });
  
  // Use regular annotate for custom annotations
  await annotate('Custom annotation message', 'info');
  
  // Test assertions
  expect(true).toBe(true);
}));
```
