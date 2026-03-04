# Test Steps in Newman

This guide covers test step reporting capabilities and limitations when using Newman with Qase reporter.

---

## Limitations

**Newman reporter does not support programmatic test steps.** Postman collection test scripts (`pm.test()`) are reported as individual test results, not as steps within a test.

Unlike other Qase reporters, there is no `qase.step()` API available in Newman/Postman test scripts.

---

## What IS Reported

Each `pm.test()` block in your Postman collection is reported as a **separate test result** in Qase:

```javascript
// Each pm.test() is reported as a separate test
pm.test('Status code is 200', function() {
  pm.response.to.have.status(200);
});

pm.test('Response time is less than 500ms', function() {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test('Response has user data', function() {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('user');
  pm.expect(jsonData.user).to.have.property('id');
});
```

Each of these three `pm.test()` calls creates a separate test result in Qase with:
- Test name (from the first argument to `pm.test()`)
- Pass/fail status
- Error message (if failed)
- Execution time

---

## Organizing Tests

### Use Descriptive Test Names

Since each `pm.test()` is a separate result, use clear, descriptive names:

```javascript
// Good: Clear, specific test names
pm.test('User ID is a positive integer', function() {
  const jsonData = pm.response.json();
  pm.expect(jsonData.userId).to.be.a('number');
  pm.expect(jsonData.userId).to.be.above(0);
});

pm.test('User email is properly formatted', function() {
  const jsonData = pm.response.json();
  pm.expect(jsonData.email).to.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
});

// Avoid: Vague test names
pm.test('Check response', function() {
  // Multiple checks - unclear what failed if this fails
  pm.expect(pm.response.code).to.equal(200);
  pm.expect(pm.response.json()).to.have.property('user');
});
```

### Group Related Tests in Folders

Organize requests into folders in your Postman collection:

```
Collection: User API
├── Folder: Authentication
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh-token
├── Folder: User Management
│   ├── GET /users/:id
│   ├── PUT /users/:id
│   └── DELETE /users/:id
└── Folder: User Profile
    ├── GET /profile
    └── PUT /profile
```

Folder structure helps organize test results in Qase.

---

## Pre-request and Test Scripts

### Pre-request Scripts

Pre-request scripts run before the request is sent and can set up test data:

```javascript
// Pre-request Script
pm.collectionVariables.set('timestamp', Date.now());
pm.collectionVariables.set('randomEmail', `user${Math.random()}@example.com`);
```

These do not create test results but prepare data for the request.

### Test Scripts

Test scripts run after the response is received and create test results:

```javascript
// Test Script
pm.test('Response status is 200', function() {
  pm.response.to.have.status(200);
});

pm.test('Response contains user data', function() {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('user');
});
```

Each `pm.test()` here creates a separate test result.

---

## Iteration Data

When running Newman with data files, each iteration creates a separate test run:

```bash
newman run collection.json -d users.csv
```

**users.csv:**
```csv
userId,username
1,john_doe
2,jane_smith
3,admin_user
```

Each row creates an iteration, and each `pm.test()` in that iteration is reported separately. Results include iteration data as parameters.

---

## Common Patterns

### API Response Validation

```javascript
pm.test('GET /users/:id returns correct status', function() {
  pm.response.to.have.status(200);
});

pm.test('Response contains required user fields', function() {
  const user = pm.response.json();
  pm.expect(user).to.have.property('id');
  pm.expect(user).to.have.property('username');
  pm.expect(user).to.have.property('email');
});

pm.test('User ID matches requested ID', function() {
  const user = pm.response.json();
  const requestedId = pm.collectionVariables.get('userId');
  pm.expect(user.id).to.equal(parseInt(requestedId));
});
```

### Error Handling Tests

```javascript
pm.test('Invalid credentials return 401', function() {
  pm.response.to.have.status(401);
});

pm.test('Error response has message', function() {
  const error = pm.response.json();
  pm.expect(error).to.have.property('message');
  pm.expect(error.message).to.include('Invalid credentials');
});
```

### Performance Tests

```javascript
pm.test('Response time is acceptable', function() {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test('Response size is reasonable', function() {
  pm.expect(pm.response.responseSize).to.be.below(10000); // 10KB
});
```

---

## Alternatives for Step-like Organization

### 1. Use Multiple pm.test() Blocks

Break complex validations into multiple `pm.test()` calls:

```javascript
// Instead of one large test
pm.test('Complete user validation', function() {
  const user = pm.response.json();
  pm.expect(user.id).to.exist;
  pm.expect(user.username).to.be.a('string');
  pm.expect(user.email).to.match(/@/);
  pm.expect(user.createdAt).to.exist;
});

// Use separate tests (reported as separate results)
pm.test('User ID exists', function() {
  const user = pm.response.json();
  pm.expect(user.id).to.exist;
});

pm.test('Username is a string', function() {
  const user = pm.response.json();
  pm.expect(user.username).to.be.a('string');
});

pm.test('Email is valid format', function() {
  const user = pm.response.json();
  pm.expect(user.email).to.match(/@/);
});

pm.test('Created timestamp exists', function() {
  const user = pm.response.json();
  pm.expect(user.createdAt).to.exist;
});
```

### 2. Chain Requests in Collection

Create a sequence of requests that represent workflow steps:

```
Collection: User Registration Flow
├── 1. POST /register (Create account)
├── 2. GET /verify-email/:token (Verify email)
├── 3. POST /login (First login)
├── 4. GET /profile (Check profile)
└── 5. PUT /profile (Update profile)
```

Each request represents a "step" in the workflow.

---

## Troubleshooting

### Tests Not Appearing in Qase

1. Verify reporter is enabled:
   ```bash
   QASE_MODE=testops newman run collection.json -r qase
   ```
2. Check that collection has `pm.test()` calls
3. Enable debug logging:
   ```json
   {
     "debug": true
   }
   ```

### All Tests Show as One Result

Ensure each validation is in a separate `pm.test()` call:

```javascript
// Incorrect: Multiple checks in one test
pm.test('Validate response', function() {
  pm.response.to.have.status(200);
  pm.expect(pm.response.json()).to.have.property('user');
  pm.expect(pm.response.json().user.id).to.exist;
});

// Correct: Separate tests
pm.test('Status is 200', function() {
  pm.response.to.have.status(200);
});

pm.test('Response has user property', function() {
  pm.expect(pm.response.json()).to.have.property('user');
});

pm.test('User has ID', function() {
  pm.expect(pm.response.json().user.id).to.exist;
});
```

### Test Names Are Generic

Use descriptive test names that indicate what's being validated:

```javascript
// Avoid
pm.test('Test 1', function() { /* ... */ });

// Good
pm.test('User ID is returned in response', function() { /* ... */ });
```

---

## See Also

- [Usage Guide](usage.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
