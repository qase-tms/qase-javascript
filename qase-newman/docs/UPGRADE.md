# Upgrade Guide: Newman Reporter

This guide covers migration steps between major versions of the Qase Newman Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| 2.2.0 | January 2026 | >= 14 | Current stable release with improved collection parsing |
| 2.1.0 | December 2025 | >= 14 | Enhanced test name extraction and metadata handling |
| 2.0.0 | August 2025 | >= 14 | Complete rewrite with new architecture |

---

## Upgrading to 2.x

### Breaking Changes

The newman-reporter-qase started with the v2.x architecture, leveraging the unified qase-javascript-commons library for consistent reporting across all test frameworks. If you are using v2.x, you are already on the latest architecture.

**No migration from a previous major version is required for newman-reporter-qase.**

### Current Version Features

Version 2.2.0 includes:

- Full support for Qase TestOps API with batch result upload
- Comment-based test case linking in Postman collection scripts
- Automatic test name extraction from Postman test names
- Request/response data capture and reporting
- Multi-project support for reporting to multiple Qase projects
- Flexible configuration via `qase.config.json`, CLI flags, or environment variables

---

## Configuration

### Current Format (v2.x)

Configuration uses the modern qase-javascript-commons format:

**qase.config.json:**

```json
{
  "mode": "testops",
  "debug": false,
  "testops": {
    "api": {
      "token": "api_token_here"
    },
    "project": "DEMO",
    "run": {
      "title": "Newman Automated Run",
      "description": "API test run from CI/CD pipeline",
      "complete": true
    },
    "batch": {
      "size": 100
    }
  }
}
```

**Environment Variables:**

```bash
export QASE_MODE=testops
export QASE_TESTOPS_API_TOKEN=your_api_token
export QASE_TESTOPS_PROJECT=DEMO
```

**Command Line:**

```bash
npx newman run collection.json -r qase \
  --reporter-qase-mode testops \
  --reporter-qase-testops-api-token your_token \
  --reporter-qase-testops-project DEMO
```

---

## Usage Pattern

### Test Case Linking via Comments

Newman uses comment-based annotations in Postman collection test scripts:

**Postman collection test script:**

```javascript
// qase: 1
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// qase: 2,3
pm.test("Response has correct structure", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('id');
  pm.expect(jsonData).to.have.property('name');
});
```

**Comment format:**

- Single test case: `// qase: 1`
- Multiple test cases: `// qase: 1,2,3`
- Must be on the line directly before `pm.test()`

**No programmatic import** - Newman reporter works with existing Postman collection syntax.

---

## API Limitations

Newman reporter has a unique constraint compared to other Qase reporters:

| Feature | Other Reporters | Newman |
|---------|----------------|--------|
| Test ID linking | `qase(id, 'name')` wrapper | `// qase: id` comment |
| Metadata (fields) | `qase.fields({...})` | Not supported |
| Steps | `qase.step()` or native steps | Not supported |
| Attachments | `qase.attach()` | Not supported |
| Titles | `qase.title()` | Auto-extracted from `pm.test()` |
| Suites | `qase.suite()` | Auto-extracted from folder structure |

**Why the limitations?**

Newman runs Postman collections without a programmatic API in test scripts. The reporter can only access what Newman provides: test names, pass/fail status, request/response data, and collection structure.

**What IS captured:**

- Test name (from `pm.test()` name)
- Test status (passed/failed)
- Request URL, method, headers, body
- Response status, headers, body
- Execution time
- Suite hierarchy (from collection folder structure)

---

## Running Tests

### Command Line Usage

**Basic:**

```bash
npx newman run collection.json -r qase
```

**With Configuration:**

```bash
QASE_MODE=testops \
QASE_TESTOPS_API_TOKEN=your_token \
QASE_TESTOPS_PROJECT=DEMO \
npx newman run collection.json -r qase
```

**With CLI Options:**

```bash
npx newman run collection.json -r qase \
  --reporter-qase-mode testops \
  --reporter-qase-testops-api-token your_token \
  --reporter-qase-testops-project DEMO \
  --reporter-qase-testops-run-title "API Tests - Production" \
  --reporter-qase-testops-run-complete true
```

**Combined with other reporters:**

```bash
npx newman run collection.json -r cli,qase
```

---

## Collection Structure

### Example Postman Collection

**Folder structure provides suite hierarchy:**

```
Collection: API Tests
├── Folder: Authentication
│   ├── Request: Login (with test: qase: 1)
│   └── Request: Logout (with test: qase: 2)
└── Folder: Users
    ├── Request: Get User (with test: qase: 3)
    └── Request: Create User (with test: qase: 4)
```

**Reported to Qase as:**

- Suite: "API Tests / Authentication"
  - Test case 1: "Login - Status code is 200"
  - Test case 2: "Logout - Status code is 200"
- Suite: "API Tests / Users"
  - Test case 3: "Get User - Response has user data"
  - Test case 4: "Create User - User created successfully"

---

## Compatibility Notes

### Node.js Version Support

- **Current (2.2.0):** Node.js >= 14

### Newman Version Support

- **Current (2.2.0):** Newman >= 5.3.0
- Tested with Newman 6.x

### Framework Compatibility

- Works with all Postman collection formats
- Compatible with Newman CLI and programmatic usage
- Supports environment and global variables
- Works with Newman's HTML and JSON reporters (combined usage)

---

## Troubleshooting

### Common Issues

#### Issue: Reporter not running

**Solution:** Ensure you're using the `-r qase` flag:

```bash
# Correct
npx newman run collection.json -r qase

# Incorrect - missing reporter flag
npx newman run collection.json
```

#### Issue: Test case IDs not recognized

**Solution:** Check your comment syntax in Postman test scripts:

```javascript
// Correct
// qase: 1
pm.test("Test name", function () { /* ... */ });

// Also correct - multiple IDs
// qase: 1,2,3
pm.test("Test name", function () { /* ... */ });

// Incorrect - missing space after colon
// qase:1
pm.test("Test name", function () { /* ... */ });

// Incorrect - not directly before pm.test()
// qase: 1

pm.test("Test name", function () { /* ... */ });
```

#### Issue: Tests not reported to Qase

**Solution:** Verify configuration:

1. Check that `QASE_MODE=testops` is set
2. Verify API token: `QASE_TESTOPS_API_TOKEN=your_token`
3. Check project code: `QASE_TESTOPS_PROJECT=YOUR_PROJECT_CODE`
4. Ensure reporter is specified: `-r qase`

#### Issue: Cannot add custom fields or steps

**Solution:** This is expected behavior. Newman reporter does not support:

- Custom fields (`qase.fields()`)
- Custom steps (`qase.step()`)
- Custom attachments (`qase.attach()`)

These features require programmatic API access that isn't available in Postman collection scripts. Use request/response data capture instead, which is automatically included in test results.

#### Issue: Configuration not recognized

**Solution:** Try different configuration methods:

**Method 1: Environment variables**
```bash
export QASE_MODE=testops
export QASE_TESTOPS_API_TOKEN=your_token
export QASE_TESTOPS_PROJECT=DEMO
npx newman run collection.json -r qase
```

**Method 2: CLI options**
```bash
npx newman run collection.json -r qase \
  --reporter-qase-mode testops \
  --reporter-qase-testops-api-token your_token \
  --reporter-qase-testops-project DEMO
```

**Method 3: qase.config.json**
```json
{
  "mode": "testops",
  "testops": {
    "api": { "token": "your_token" },
    "project": "DEMO"
  }
}
```

---

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/qase-tms/qase-javascript/issues)
2. Review the [CHANGELOG](../../CHANGELOG.md)
3. Open a new issue with:
   - Current version (2.2.0)
   - Newman version
   - Error messages
   - Configuration method used
   - Example collection (without sensitive data)
   - Command used to run Newman
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [CHANGELOG](../../CHANGELOG.md)
- [Newman Documentation](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/)
- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)
