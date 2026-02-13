# Upgrade Guide: WDIO Reporter

This guide covers migration steps between major versions of the Qase WDIO Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| 1.2.0 | January 2026 | >= 14 | Current stable release with enhanced Cucumber integration |
| 1.1.0 | December 2025 | >= 14 | Multi-project support and improved step handling |
| 1.0.0 | August 2025 | >= 14 | Initial release with unified qase-javascript-commons |

---

## Upgrading to 1.x

### Breaking Changes

The wdio-qase-reporter is currently in its first major version series (1.x). No migration from a previous major version is required.

### Current Version Features

Version 1.2.0 includes:

- Full support for Qase TestOps API with batch result upload
- Dual framework support: Mocha/Jasmine and Cucumber
- Test case linking via wrapper function or Gherkin tags
- Rich metadata support: titles, fields, suites, parameters, comments
- Step reporting for both Mocha/Jasmine and Cucumber modes
- File and content-based attachments
- Multi-project support for reporting to multiple Qase projects
- Flexible configuration via `wdio.conf.js` or `qase.config.json`

---

## Configuration

### Current Format (v1.x)

Configuration uses the modern qase-javascript-commons format:

**wdio.conf.js (Mocha/Jasmine):**

```javascript
exports.config = {
  framework: 'mocha', // or 'jasmine'
  reporters: [
    'spec',
    [
      'qase',
      {
        mode: 'testops',
        debug: false,
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'DEMO',
          run: {
            title: 'WDIO Automated Run',
            description: 'Test run from CI/CD pipeline',
            complete: true,
          },
          batch: {
            size: 100,
          },
        },
      },
    ],
  ],
  // ... other WDIO config
};
```

**wdio.conf.js (Cucumber):**

```javascript
exports.config = {
  framework: 'cucumber',
  reporters: [
    'spec',
    [
      'qase',
      {
        mode: 'testops',
        testops: {
          api: { token: process.env.QASE_API_TOKEN },
          project: 'DEMO',
        },
      },
    ],
  ],
  cucumberOpts: {
    require: ['./step-definitions/**/*.js'],
  },
  // ... other WDIO config
};
```

**Alternative: qase.config.json**

```json
{
  "mode": "testops",
  "testops": {
    "api": {
      "token": "api_token_here"
    },
    "project": "DEMO",
    "run": {
      "complete": true
    }
  }
}
```

---

## Framework-Specific Usage

### Mocha/Jasmine Mode

**Import Pattern:**

```javascript
import { qase } from 'wdio-qase-reporter';
```

**Test ID Linking:**

```javascript
import { qase } from 'wdio-qase-reporter';

describe('User Authentication', () => {
  it(qase(1, 'User can login'), async () => {
    await browser.url('https://example.com/login');
    await $('#username').setValue('user@example.com');
    await $('#password').setValue('password123');
    await $('#login-button').click();

    await expect($('.dashboard')).toBeDisplayed();
  });

  it(qase([1, 2], 'Multiple IDs'), async () => {
    // Test code
  });
});
```

**Metadata:**

```javascript
it('Test with metadata', async () => {
  qase.title('Custom test title');
  qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
  qase.suite('Authentication / Login');

  // Test code
});
```

**Steps:**

```javascript
it('Test with steps', async () => {
  await qase.step('Navigate to login page', async () => {
    await browser.url('https://example.com/login');
  });

  await qase.step('Enter credentials', async () => {
    await $('#username').setValue('user@example.com');
    await $('#password').setValue('password123');
  });

  await qase.step('Verify login success', async () => {
    await expect($('.dashboard')).toBeDisplayed();
  });
});
```

**Attachments:**

```javascript
// Path-based
await qase.attach({ paths: '/path/to/log.txt' });

// Content-based
await qase.attach({
  name: 'screenshot.png',
  content: await browser.takeScreenshot(),
  contentType: 'image/png',
});
```

---

### Cucumber Mode

**Gherkin Tags:**

```gherkin
Feature: User Authentication
  As a user
  I want to log in to the application
  So I can access my account

  @QaseID=1
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should see the dashboard

  @QaseID=2
  @QaseFields={'severity':'high','priority':'critical'}
  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter invalid credentials
    And I click the login button
    Then I should see an error message
```

**Step Definitions:**

```javascript
import { Given, When, Then } from '@wdio/cucumber-framework';

Given('I am on the login page', async () => {
  await browser.url('https://example.com/login');
});

When('I enter valid credentials', async () => {
  await $('#username').setValue('user@example.com');
  await $('#password').setValue('password123');
});

Then('I should see the dashboard', async () => {
  await expect($('.dashboard')).toBeDisplayed();
});
```

**Attachments in Cucumber:**

```javascript
import { Given } from '@wdio/cucumber-framework';

Given('I take a screenshot', async function () {
  const screenshot = await browser.takeScreenshot();
  await this.attach(screenshot, 'image/png');
});
```

---

## Reporter-Specific Options

WDIO reporter includes additional configuration options:

```javascript
reporters: [
  [
    'qase',
    {
      mode: 'testops',
      testops: {
        api: { token: 'token' },
        project: 'DEMO',
      },
      // WDIO-specific options
      disableWebdriverStepsReporting: false, // Report WebDriver commands as steps
      disableWebdriverScreenshotsReporting: false, // Report screenshots
      useCucumber: false, // Enable Cucumber integration (auto-detected)
    },
  ],
],
```

**Options:**

- `disableWebdriverStepsReporting`: Disable automatic reporting of WebDriver commands as steps
- `disableWebdriverScreenshotsReporting`: Disable automatic screenshot attachment
- `useCucumber`: Enable Cucumber mode (usually auto-detected from framework config)

---

## Compatibility Notes

### Node.js Version Support

- **Current (1.2.0):** Node.js >= 14

### WebdriverIO Version Support

- **Current (1.2.0):** WebdriverIO >= 8.40.0
- Tested with WDIO 8.x and 9.x

### Framework Compatibility

- **Mocha:** Full support for wrapper function pattern, metadata, steps, attachments
- **Jasmine:** Full support for wrapper function pattern, metadata, steps, attachments
- **Cucumber:** Tag-based linking, native Gherkin steps, native attachments
- ES Modules recommended
- CommonJS supported
- TypeScript support with full type definitions

---

## Troubleshooting

### Common Issues

#### Issue: Reporter not recognized

**Solution:** Ensure the reporter is installed and configured:

```bash
npm install --save-dev wdio-qase-reporter
```

```javascript
// wdio.conf.js
reporters: [
  ['qase', { /* options */ }],
],
```

#### Issue: Mocha/Jasmine mode - wrapper function not working

**Solution:** Verify import path and usage:

```javascript
// Correct
import { qase } from 'wdio-qase-reporter';

describe('Tests', () => {
  it(qase(1, 'Test name'), async () => { /* ... */ });
});

// Incorrect - missing qase wrapper
it('Test name', async () => { /* ... */ });
```

#### Issue: Cucumber mode - tags not recognized

**Solution:** Check tag syntax in feature files:

```gherkin
# Correct
@QaseID=1
Scenario: Test scenario

# Incorrect - missing equals sign
@QaseID 1
Scenario: Test scenario
```

#### Issue: Steps not reporting in Mocha/Jasmine mode

**Solution:** Use `qase.step()` with async callbacks:

```javascript
// Correct
await qase.step('Step name', async () => {
  await browser.url('https://example.com');
});

// Incorrect - missing await
qase.step('Step name', async () => {
  await browser.url('https://example.com');
});
```

#### Issue: Cucumber attachments not appearing

**Solution:** Use native `this.attach()` in step definitions:

```javascript
// Correct - in step definition
When('I capture screenshot', async function () {
  const screenshot = await browser.takeScreenshot();
  await this.attach(screenshot, 'image/png');
});

// Incorrect - qase.attach() not supported in Cucumber mode
When('I capture screenshot', async () => {
  const screenshot = await browser.takeScreenshot();
  await qase.attach({ content: screenshot }); // Error
});
```

#### Issue: Configuration not recognized

**Solution:** Verify configuration structure in `wdio.conf.js`:

```javascript
reporters: [
  [
    'qase',
    {
      mode: 'testops',
      testops: {
        api: { token: process.env.QASE_API_TOKEN },
        project: 'YOUR_PROJECT_CODE',
      },
    },
  ],
],
```

Or use `qase.config.json`:

```json
{
  "mode": "testops",
  "testops": {
    "api": { "token": "your_token" },
    "project": "YOUR_PROJECT_CODE"
  }
}
```

---

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/qase-tms/qase-javascript/issues)
2. Review the CHANGELOG
3. Open a new issue with:
   - Current version (1.2.0)
   - WebdriverIO version
   - Framework (Mocha/Jasmine/Cucumber)
   - Error messages
   - Configuration file (without sensitive data)
   - Test code example
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- CHANGELOG
- [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
