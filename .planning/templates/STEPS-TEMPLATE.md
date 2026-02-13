# Test Steps in {{FRAMEWORK_NAME}}

This guide covers how to define and report test steps for detailed execution tracking in Qase.

---

## Overview

Test steps provide granular visibility into test execution. Each step is reported separately, showing:

- Step name and description
- Step status (passed/failed)
- Step duration
- Attachments (if any)
- Error details (on failure)

---

## Defining Steps

### Using Async Function

Define steps as async functions with callbacks:

{{STEP_ASYNC_EXAMPLE}}

### Step Parameters

Steps can include parameters for dynamic naming:

{{STEP_PARAMS_EXAMPLE}}

---

## Nested Steps

Create hierarchical step structures:

{{NESTED_STEPS_EXAMPLE}}

---

## Steps with Expected Result and Data

Define expected results and data for steps:

{{STEP_EXPECTED_DATA_EXAMPLE}}

**Signature:**
```typescript
await qase.step(
  name: string,
  callback: () => Promise<void> | void,
  expectedResult?: string,
  data?: string
): Promise<void>
```

---

## Steps with Attachments

Attach content to a specific step:

{{STEP_ATTACHMENTS_EXAMPLE}}

---

## Step Status

Steps automatically inherit status from execution:

| Execution | Step Status |
|-----------|-------------|
| Completes normally | Passed |
| Throws Error/AssertionError | Failed |
| Other exception | Invalid |

---

## Best Practices

### Keep Steps Atomic

Each step should represent a single action:

```javascript
// Good: One action per step
await qase.step('Click login button', async () => {
  await page.click('#login-btn');
});

await qase.step('Enter username', async () => {
  await page.fill('#username', 'user');
});

// Avoid: Multiple actions in one step
await qase.step('Fill form and submit', async () => {  // Too broad
  await page.fill('#username', 'user');
  await page.fill('#password', 'pass');
  await page.click('#submit');
});
```

### Use Descriptive Names

```javascript
// Good: Clear action description
await qase.step('Verify user is redirected to dashboard', async () => {
  expect(page.url()).toContain('/dashboard');
});

// Avoid: Vague names
await qase.step('Check page', async () => {
  expect(page.url()).toContain('/dashboard');
});
```

### Include Context in Step Names

```javascript
// Good: Include relevant context
await qase.step(`Add product '${productName}' to cart`, async () => {
  await addToCart(productName);
});

// Better than generic:
await qase.step('Add product', async () => {
  await addToCart(productName);
});
```

---

## Common Patterns

### Page Object Steps

{{PATTERN_PAGE_OBJECT_EXAMPLE}}

### API Testing Steps

{{PATTERN_API_EXAMPLE}}

### Setup/Teardown Steps

{{PATTERN_SETUP_TEARDOWN_EXAMPLE}}

---

## Troubleshooting

### Steps Not Appearing

1. Verify the step function is properly imported from `{{PACKAGE_NAME}}/{{FRAMEWORK_INTEGRATION_PATH}}`
2. Check that steps are executed within a test context
3. Enable debug logging to trace step recording
4. Ensure you're using `await` with async step callbacks

### Nested Steps Flattened

Ensure you're using the async callbacks correctly for nesting:

```javascript
// Correct: Nested callbacks
await qase.step('Parent step', async () => {
  await qase.step('Child step', async () => {
    // Child step logic
  });
});

// Incorrect: Sequential, not nested
await qase.step('Step 1', async () => {
  // Step 1 logic
});
await qase.step('Step 2', async () => {  // Not nested under Step 1
  // Step 2 logic
});
```

### Step Duration Shows 0

Steps need measurable execution time. Very fast steps may show 0ms duration.

---

## See Also

- [Usage Guide](usage.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
