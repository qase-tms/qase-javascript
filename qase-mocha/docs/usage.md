# Qase Integration in Mocha

This guide demonstrates how to integrate Qase with Mocha, providing instructions on how to add Qase IDs, titles,
fields, suites, comments, and file attachments to your test cases.

---

## Adding QaseID to a Test

To associate a QaseID with a test in Mocha, use the `qase()` function. This function accepts a single integer or
an array of integers representing the test's ID(s) in Qase, and optionally a custom test name.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it(qase(1, 'Successful login'), function() {
    expect(true).to.equal(true);
  });

  it(qase([2, 3, 4], 'Multiple test cases'), function() {
    expect(true).to.equal(true);
  });
});
```

---

## Adding a Title to a Test

You can provide a custom title for your test using the `this.title()` method within the test function.
If no title is provided, the test's default name will be used.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('test with custom title', function() {
    this.title('Custom Test Title');
    expect(true).to.equal(true);
  });

  it('test with default title', function() {
    expect(true).to.equal(true);
  });
});
```

---

## Adding Fields to a Test

You can add additional metadata to a test case using the `this.fields()` method. This allows you
to specify multiple fields to enhance test case information in Qase.

### System Fields

- `description` — Description of the test case.
- `preconditions` — Preconditions for the test case.
- `postconditions` — Postconditions for the test case.
- `severity` — Severity of the test case (e.g., `critical`, `major`).
- `priority` — Priority of the test case (e.g., `high`, `low`).
- `layer` — Test layer (e.g., `UI`, `API`).

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('test with fields', function() {
    this.fields({
      severity: 'high',
      priority: 'medium',
      description: 'Login functionality test',
      custom_field: 'value'
    });
    expect(true).to.equal(true);
  });
});
```

---

## Adding a Suite to a Test

To assign a suite or sub-suite to a test, use the `this.suite()` method. It can receive a suite
name, and optionally a sub-suite, both as strings.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('test with suite', function() {
    this.suite('Authentication');
    expect(true).to.equal(true);
  });

  it('test with nested suite', function() {
    this.suite('Authentication\\Login\\Edge Cases');
    expect(true).to.equal(true);
  });
});
```

---

## Ignoring a Test in Qase

To exclude a test from being reported to Qase (while still executing the test in Mocha), use the `this.ignore()`
method. The test will run, but its result will not be sent to Qase.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('ignored test', function() {
    this.ignore();
    expect(true).to.equal(true);
  });
});
```

---

## Adding Parameters to a Test

You can add parameters to a test case using the `this.parameters()` method. This method accepts
an object with parameter names and values.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('test with parameters', function() {
    this.parameters({
      browser: 'chrome',
      environment: 'staging'
    });
    expect(true).to.equal(true);
  });
});
```

---

## Adding Group Parameters to a Test

To add group parameters to a test case, use the `this.groupParameters()` method. This method
accepts an object with group parameter names and values.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('test with group parameters', function() {
    this.parameters({
      browser: 'chrome',
      environment: 'staging'
    });
    this.groupParameters({
      test_group: 'authentication',
      test_type: 'smoke'
    });
    expect(true).to.equal(true);
  });
});
```

---

## Adding Steps to a Test

You can add custom steps to your test cases using the `this.step()` method. Each step should
have a title and optionally a function.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('test with steps', function() {
    this.step('Navigate to login page', function() {
      // Step implementation
    });
    this.step('Enter credentials', function() {
      // Step implementation
    });
    this.step('Submit login form', function() {
      // Step implementation
    });
    this.step('Verify successful login', function() {
      // Step implementation
    });
    expect(true).to.equal(true);
  });
});
```

---

## Attaching Files to a Test

You can attach files to test results using the `this.attach()` method. This method supports attaching files
with content, paths, or media types.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('test with attachments', function() {
    // Attach text content
    this.attach({
      name: 'attachment.log',
      content: 'Login successful',
      contentType: 'text/plain'
    });
    
    // Attach JSON data
    const userData = { username: 'testuser', status: 'logged_in' };
    this.attach({
      name: 'user-data.json',
      content: JSON.stringify(userData, null, 2),
      contentType: 'application/json'
    });
    
    expect(true).to.equal(true);
  });
});
```

---

## Adding Comments to a Test

You can add comments to test results using the `this.comment()` method. This is useful for providing additional
context or explanations about test execution.

### Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  it('test with comments', function() {
    // Add comment about the test execution
    this.comment('Login test completed successfully');
    
    // Add comment with additional context
    this.comment('User was redirected to dashboard as expected');
    
    expect(true).to.equal(true);
  });
});
```

---

### Parallel Execution

The reporter supports parallel execution of tests. First, create a new run in Qase.io using the Qase CLI:

```bash
# Create a new test run
qasectl testops run create --project DEMO --token token --title 'Mocha test run'

# Save the run ID to the environment variable
export QASE_TESTOPS_RUN_ID=$(< qase.env grep QASE_TESTOPS_RUN_ID | cut -d'=' -f2)
```

Then run tests in parallel:

```bash
QASE_MODE=testops mocha --parallel
```

After the tests are finished, complete the run:

```bash
qasectl testops run complete --project DEMO --token token --id $(echo $QASE_TESTOPS_RUN_ID)
```
