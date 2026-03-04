# Qase Integration in Newman

This guide provides comprehensive instructions for integrating Qase with Newman (Postman CLI runner).

> **Configuration:** For complete configuration reference including all available options, environment variables, and examples, see the [qase-javascript-commons README](../../qase-javascript-commons/README.md).

---

## Table of Contents

- [Adding QaseID](#adding-qaseid)
- [Working with Parameters](#working-with-parameters)
- [Test Result Mapping](#test-result-mapping)
- [Running Tests](#running-tests)
- [Troubleshooting](#troubleshooting)
- [Integration Patterns](#integration-patterns)
- [Common Use Cases](#common-use-cases)

- [Limitations](#limitations)
- [See Also](#see-also)
---

## Adding QaseID

Link your Newman/Postman tests to existing test cases in Qase by specifying the test case ID using special comments in your test scripts.

> **Important:** Newman uses comment-based annotations, not programmatic imports like other frameworks. The comment must be placed immediately before the `pm.test()` call.

### Single ID

```javascript
// qase: 222
pm.test('Status code is 200', function() {
  pm.response.to.have.status(200);
});
```

### Multiple IDs

Newman supports several formats for multiple IDs:

```javascript
// Qase: 1, 2, 3
pm.test('Verify response structure', function() {
  pm.expect(pm.response.json()).to.have.property('data');
});

// Alternative space-separated format
// qase: 4 5 6 14
pm.test('Check multiple conditions', function() {
  pm.response.to.be.ok;
});
```

### Supported Comment Formats

All of these formats are valid:

- `// qase: 10` (lowercase, single ID)
- `// Qase: 1, 2, 3` (capitalized, comma-separated)
- `// qase: 4 5 6` (space-separated)
- `//qase: 7` (no space after //)

---

## Working with Parameters

Newman supports parameterized tests when using data files (`-d` or `--data` option). You can control which parameters are reported to Qase using special comments.

### Specifying Parameters Explicitly

Add a comment to specify which parameters to report:

```javascript
// qase.parameters: userId, user.name
pm.test('User ID is correct', function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.userId).to.eql(pm.iterationData.get('userid'));
});
```

### Example Data File

Create a `data.json` file:

```json
[
  {
    "userid": 1,
    "user": {
      "name": "John",
      "age": 30
    }
  },
  {
    "userid": 2,
    "user": {
      "name": "Jane",
      "age": 25
    }
  }
]
```

### Run with Data File

```bash
newman run collection.json -r qase -d data.json
```

### Collection-Level Parameters

You can also specify parameters at the collection or folder level. All tests within will inherit these parameters:

```json
{
  "info": {
    "name": "API Tests"
  },
  "item": [
    {
      "name": "User Folder",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "// qase.parameters: userId, user.name"
            ],
            "type": "text/javascript"
          }
        }
      ],
      "item": [
        {
          "name": "Get User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('User found', function() {",
                  "  pm.response.to.have.status(200);",
                  "})"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Auto-Collect All Parameters

To automatically report all parameters from data files without manually specifying them, enable the `autoCollectParams` option:

```json
{
  "mode": "testops",
  "testops": {
    "api": {
      "token": "api_token"
    },
    "project": "project_code"
  },
  "framework": {
    "newman": {
      "autoCollectParams": true
    }
  }
}
```

With this enabled, all tests will automatically report all available parameters from the data file.

### Nested Parameter Access

You can access nested object properties using dot notation:

```javascript
// qase.parameters: user.name, user.age, address.city
pm.test('User data is correct', function() {
  pm.expect(pm.iterationData.get('user.name')).to.eql('John');
});
```

---

## Test Result Mapping

Newman test results are mapped to Qase statuses:

| Newman Result | Qase Status | Description |
|---------------|-------------|-------------|
| Passed | passed | Test assertion succeeded |
| Failed | failed | Test assertion failed |
| Skipped | skipped | Test was not executed |

---

## Running Tests

### Basic Execution

```bash
# Run collection with Qase reporter
QASE_MODE=testops newman run ./collection.json -r qase

# Run specific folder
QASE_MODE=testops newman run ./collection.json -r qase --folder "API Tests"
```

### Multiple Reporters

```bash
# Combine CLI output with Qase reporting
newman run ./collection.json -r cli,qase

# JSON output and Qase
newman run ./collection.json -r json,qase
```

### With Environment

```bash
# Use Postman environment file
newman run ./collection.json -r qase -e ./production.postman_environment.json

# Override environment variables
QASE_MODE=testops \
QASE_TESTOPS_PROJECT=DEMO \
newman run ./collection.json -r qase
```

### With Data Files

```bash
# JSON data file
newman run ./collection.json -r qase -d ./users.json

# CSV data file
newman run ./collection.json -r qase -d ./test-data.csv
```

### Programmatic Usage

```javascript
const newman = require('newman');

newman.run({
  collection: require('./collection.json'),
  environment: require('./environment.json'),
  reporters: ['qase'],
  iterationData: './data.json',
  reporter: {
    qase: {
      // Reporter-specific options (optional)
      // Prefer using qase.config.json for consistency
    }
  }
}, function(err) {
  if (err) {
    throw err;
  }
  console.log('Collection run complete');
});
```

### CI/CD Integration

```bash
#!/bin/bash
# ci-run.sh

# Exit on error
set -e

# Load API token from CI environment
export QASE_MODE=testops
export QASE_TESTOPS_PROJECT=DEMO
export QASE_TESTOPS_API_TOKEN="${CI_QASE_TOKEN}"

# Run Newman with Qase reporter
newman run ./api-tests.json \
  -r qase \
  -e ./ci-environment.json \
  --bail \
  --color off
```

---

## Troubleshooting

### Tests Not Appearing in Qase

**Problem:** Tests run successfully but don't appear in Qase TestOps.

**Solutions:**

1. **Verify mode is set to TestOps:**
   ```bash
   # Check environment variable
   echo $QASE_MODE  # Should output: testops

   # Or check qase.config.json
   cat qase.config.json | grep mode
   ```

2. **Verify API token is correct:**
   ```bash
   # Test token is valid
   curl -H "Token: YOUR_API_TOKEN" https://api.qase.io/v1/project
   ```

3. **Check project code:**
   - Ensure project code in config matches your Qase project
   - Project codes are case-sensitive

4. **Enable debug logging:**
   ```json
   {
     "debug": true,
     "TestOps": {
       "api": { "token": "..." },
       "project": "DEMO"
     }
   }
   ```

### QaseID Comments Not Working

**Problem:** Tests with `// qase: N` comments not linking to test cases.

**Solutions:**

1. **Verify comment format:**
   ```javascript
   // Correct:
   // qase: 1
   pm.test('Test name', function() { ... });

   // Incorrect (comment too far from test):
   // qase: 1

   pm.test('Test name', function() { ... });
   ```

2. **Check test case ID exists:**
   - Verify the test case ID exists in your Qase project
   - IDs are specific to each project

3. **Check for typos:**
   ```javascript
   // Correct:
   // qase: 1

   // Incorrect:
   // quase: 1
   // qse: 1
   ```

### Parameters Not Reported

**Problem:** Data file parameters not appearing in Qase results.

**Solutions:**

1. **Add parameter comment:**
   ```javascript
   // qase.parameters: userId, user.name
   pm.test('Test with params', function() { ... });
   ```

2. **Or enable auto-collection:**
   ```json
   {
     "framework": {
       "newman": {
         "autoCollectParams": true
       }
     }
   }
   ```

3. **Verify data file format:**
   ```json
   // Correct JSON format:
   [
     { "userId": 1, "name": "John" },
     { "userId": 2, "name": "Jane" }
   ]
   ```

4. **Check parameter names match:**
   ```javascript
   // Comment uses: userId
   // qase.parameters: userId

   // Data file must have:
   { "userId": 1 }  // Correct
   { "userid": 1 }  // Wrong case
   ```

### Reporter Not Found

**Problem:** `Error: Reporter "Qase" not found`.

**Solutions:**

1. **Install the reporter:**
   ```bash
   npm install --save-dev newman-reporter-Qase
   ```

2. **Verify installation:**
   ```bash
   npm list newman-reporter-Qase
   ```

3. **Check Node.js and Newman versions:**
   ```bash
   node --version  # Should be >= 14
   newman --version  # Should be >= 5.3.0
   ```

### Collection Format Issues

**Problem:** Collection file parsing errors.

**Solutions:**

1. **Validate collection format:**
   - Export collection from Postman (v2.1 format)
   - Use Postman Collection SDK to validate

2. **Check JSON syntax:**
   ```bash
   # Validate JSON
   cat collection.json | jq .
   ```

3. **Re-export from Postman:**
   - Open in Postman → Collection Settings → Export → v2.1

---

## Integration Patterns

### Pattern 1: API Smoke Tests

```javascript
// Collection: API Smoke Tests
// Folder: Critical Endpoints

// qase: 101
// qase.parameters: environment
pm.test('Health check endpoint responds', function() {
  pm.response.to.have.status(200);
  pm.expect(pm.response.json().status).to.eql('healthy');
});

// qase: 102
pm.test('Authentication endpoint is accessible', function() {
  pm.response.to.have.status(200);
});
```

### Pattern 2: Parameterized User Tests

**Data file (users.json):**
```json
[
  { "role": "admin", "userId": 1, "expectedStatus": 200 },
  { "role": "user", "userId": 2, "expectedStatus": 200 },
  { "role": "guest", "userId": 3, "expectedStatus": 403 }
]
```

**Test script:**
```javascript
// qase: 201
// qase.parameters: role, userId, expectedStatus
pm.test('User access based on role', function() {
  pm.expect(pm.response.code).to.eql(pm.iterationData.get('expectedStatus'));
});
```

### Pattern 3: Environment-Specific Tests

**Collection-level script:**
```javascript
// qase.parameters: environment
// Set in pre-request or test event at collection level
```

**Individual test:**
```javascript
// qase: 301
pm.test('API responds correctly in ' + pm.environment.get('env'), function() {
  pm.response.to.be.ok;
  pm.expect(pm.response.json()).to.have.property('data');
});
```

### Pattern 4: Chained Requests with Shared Context

```javascript
// Request 1: Login
// qase: 401
pm.test('Login successful', function() {
  pm.response.to.have.status(200);
  var token = pm.response.json().token;
  pm.environment.set('authToken', token);
});

// Request 2: Get User (uses token from Request 1)
// qase: 402
pm.test('Fetch user data with token', function() {
  pm.response.to.have.status(200);
  pm.expect(pm.response.json()).to.have.property('user');
});
```

---

## Common Use Cases

### Use Case 1: Report API Test Collection

```bash
# Run entire collection
QASE_MODE=testops newman run ./api-tests.json -r qase
```

### Use Case 2: Run in CI/CD Pipeline

**.gitlab-ci.yml:**
```yaml
newman-tests:
  stage: test
  image: postman/newman:latest
  script:
    - npm install -g newman-reporter-qase
    - newman run collection.json -r qase
  variables:
    QASE_MODE: testops
    QASE_TESTOPS_PROJECT: DEMO
    QASE_TESTOPS_API_TOKEN: $CI_QASE_TOKEN
```

### Use Case 3: Test with Multiple Environments

```bash
# Production
QASE_MODE=testops newman run collection.json -r qase -e prod.json

# Staging
QASE_MODE=testops newman run collection.json -r qase -e staging.json
```

### Use Case 4: Filter and Report Specific Folder

```bash
# Only run tests in "Critical" folder
newman run collection.json -r qase --folder "Critical"
```

### Use Case 5: Programmatic Run with Custom Options

```javascript
const newman = require('newman');
const fs = require('fs');

const collections = ['auth.json', 'users.json', 'products.json'];

collections.forEach(collectionFile => {
  newman.run({
    collection: require(`./${collectionFile}`),
    reporters: ['qase'],
    environment: require('./environment.json')
  }, (err, summary) => {
    if (err) {
      console.error(`Failed: ${collectionFile}`);
      throw err;
    }
    console.log(`Completed: ${collectionFile}`);
  });
});
```

### Use Case 6: Data-Driven Testing with CSV

**test-data.csv:**
```csv
userId,username,expectedStatus
1,admin,200
2,user,200
3,guest,403
```

**Run:**
```bash
newman run collection.json -r qase -d test-data.csv
```

**Test script:**
```javascript
// qase: 601
// qase.parameters: userId, username, expectedStatus
pm.test('Access control for ' + pm.iterationData.get('username'), function() {
  pm.expect(pm.response.code).to.eql(
    parseInt(pm.iterationData.get('expectedStatus'))
  );
});
```

### Use Case 7: Parallel Execution with Different Data

```bash
# Terminal 1: Run with dataset A
newman run collection.json -r qase -d dataset-a.json

# Terminal 2: Run with dataset B
newman run collection.json -r qase -d dataset-b.json
```

### Use Case 8: Integration with Pre-Request Scripts

```javascript
// Pre-request script (collection or folder level)
// Set dynamic parameters
pm.variables.set('timestamp', new Date().toISOString());
pm.variables.set('requestId', Date.now());

// Test script
// qase: 801
// qase.parameters: timestamp, requestId
pm.test('Request tracking', function() {
  pm.response.to.have.status(200);
});
```

### Use Case 9: Custom Test Run Titles

**qase.config.json:**
```json
{
  "mode": "testops",
  "testops": {
    "api": { "token": "..." },
    "project": "DEMO",
    "run": {
      "title": "API Regression - {{date}}",
      "description": "Automated API tests"
    }
  }
}
```

### Use Case 10: Conditional Testing Based on Environment

```javascript
// qase: 901
pm.test('Feature X available in production', function() {
  const env = pm.environment.get('environment');

  if (env === 'production') {
    pm.expect(pm.response.json().features).to.include('featureX');
  } else {
    pm.expect(pm.response.json().features).to.not.include('featureX');
  }
});
```

---

## Limitations

Newman reporter has some limitations compared to programmatic reporters:

### No Steps Support

Newman does not support test steps. All test assertions are reported at the test level.

**Workaround:** Use multiple `pm.test()` calls for granular reporting:

```javascript
// Instead of steps, use separate tests
// qase: 1
pm.test('Step 1: Response is successful', function() {
  pm.response.to.be.ok;
});

// qase: 1
pm.test('Step 2: Response has data', function() {
  pm.expect(pm.response.json()).to.have.property('data');
});
```

### No Suite Organization

Newman does not support programmatic suite assignment. Test organization comes from Postman collection structure (folders).

**Workaround:** Use Postman folders to organize tests into logical suites.

### No Custom Fields

Newman does not support adding custom fields (severity, priority, etc.) via comments.

**Workaround:** Set fields manually in Qase TestOps UI after test case creation.

### No Attachments

Newman reporter does not support attaching files or screenshots to test results.

**Workaround:** Use Postman's native logging and save artifacts separately.

### No Ignore Functionality

Individual tests cannot be excluded from reporting.

**Workaround:** Use Newman's `--folder` flag to run only specific folders.

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Newman Documentation](https://www.npmjs.com/package/newman)
- [Postman Collection Format](https://schema.postman.com/)
- [Example Collections](../../examples/single/newman/)
