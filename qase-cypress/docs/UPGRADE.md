# Upgrade Guide: Cypress Reporter

This guide covers migration steps between major versions of the Qase Cypress Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| 3.2.0 | January 2026 | >= 14 | Current stable release with video attachment support |
| 3.1.0 | December 2025 | >= 14 | Enhanced metadata handling and stability improvements |
| 3.0.0 | August 2025 | >= 14 | **Major:** Video attachment support, improved configuration |
| 2.3.1 | July 2025 | >= 14 | Final v2.x release with bug fixes |
| 2.0.0 | March 2025 | >= 14 | Complete rewrite with new architecture |

---

## Upgrading to 3.9.0

- **Node.js 22, 24 or >= 26** and **Cypress 13 – 16** are required, matching what Cypress 16 supports. Stay on 3.8.x for older Node.js or Cypress.
- `mocha` is no longer a required peer dependency: the reporter runs on the mocha bundled with Cypress. Install it yourself only if your own setup needs it, e.g. for `cypress-multi-reporters`.
- The `log` task registered by `cypress-qase-reporter/metadata` is renamed to `qaseLog`, so it no longer overrides a `log` task of your own. If you called `cy.task('log', ...)` without registering it yourself, register it in `setupNodeEvents`.

---

## Upgrading to 3.x from 2.x

Version 3.0.0 introduces video attachment support for Cypress tests, allowing automatic upload of test execution videos to Qase.

### Breaking Changes

1. **Configuration Structure:** New video-related configuration options added
2. **Hook Setup:** New `afterSpecHook` required for video upload functionality
3. **Attachment Handling:** Video attachments now use `preparedAttachments` for better management

### Migration Steps

#### 1. Update Package

```bash
npm install --save-dev cypress-qase-reporter@3.2.0
```

#### 2. Update Configuration

**Before (v2.3.x):**

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
    },
  },
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
    testops: {
      api: {
        token: process.env.QASE_API_TOKEN,
      },
      project: 'DEMO',
    },
  },
});
```

**After (v3.2.0):**

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');
const { afterSpecHook } = require('cypress-qase-reporter/hooks');

module.exports = defineConfig({
  e2e: {
    video: true, // Enable video recording
    videosFolder: 'cypress/videos', // Specify video folder
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);

      // Add afterSpecHook for video upload (since 3.6.1 the plugin registers it for you)
      on('after:spec', async (spec) => {
        await afterSpecHook(spec, config);
      });

      return config;
    },
  },
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
    testops: {
      api: {
        token: process.env.QASE_API_TOKEN,
      },
      project: 'DEMO',
    },
    framework: {
      cypress: {
        videosFolder: 'cypress/videos', // Where the reporter looks for videos; must match Cypress
        uploadDelay: 10, // Optional: delay before video upload (seconds)
      },
    },
  },
});
```

#### 3. Enable Video Recording

Ensure video recording is enabled in your Cypress configuration:

```javascript
{
  e2e: {
    video: true, // Must be true for video attachments
    videosFolder: 'cypress/videos', // Default location
  }
}
```

#### 4. Update Test Annotations

No changes required for test annotations. The Qase API remains unchanged:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Test suite', () => {
  it(qase(1, 'Test with video'), () => {
    cy.visit('https://example.com');
    cy.get('.button').click();
  });
});
```

---

## Configuration Changes

### New Options in v3.0.0

| Option | Description | Default |
|--------|-------------|---------|
| `framework.cypress.videosFolder` | Folder the reporter searches for spec videos to attach. Videos are not uploaded without it | — |
| `framework.cypress.uploadDelay` | Delay (in seconds) before uploading videos after the spec completes | 10 |

**Example:**

```javascript
reporterOptions: {
  mode: 'testops',
  testops: {
    api: { token: 'token' },
    project: 'DEMO',
  },
  framework: {
    cypress: {
      videosFolder: 'cypress/videos',
      uploadDelay: 5, // Wait 5 seconds before video upload
    },
  },
}
```

### Video Upload Behavior

- Videos are automatically attached to test results when video recording is enabled
- Cypress records one video per spec, and the reporter attaches it to every result of that spec
- Videos are uploaded after the spec file completes execution, `uploadDelay` seconds later (10 by default)

---

## API Changes

### No Breaking API Changes

The Qase test annotation API remains fully backward compatible:

```javascript
// All existing patterns work in v3.x
import { qase } from 'cypress-qase-reporter/mocha';

describe('Tests', () => {
  it(qase(1, 'Single ID'), () => { /* ... */ });
  it(qase([1, 2], 'Multiple IDs'), () => { /* ... */ });
});

it('Test with metadata', () => {
  qase.title('Custom title');
  qase.fields({ severity: 'critical' });
  qase.attach({ paths: 'screenshot.png' });
});
```

### New Internal Methods

These methods are used internally by the reporter and do not require direct usage:

- `uploadAttachment()` - Handles attachment upload to Qase
- `preparedAttachments` - Property for managing attachments before upload

---

## Before/After Examples

### Example 1: Basic Configuration

**Before (v2.3.x):**

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
    },
  },
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
    testops: {
      api: { token: process.env.QASE_API_TOKEN },
      project: 'DEMO',
    },
  },
});
```

**After (v3.2.0):**

```javascript
const { defineConfig } = require('cypress');
const { afterSpecHook } = require('cypress-qase-reporter/hooks');

module.exports = defineConfig({
  e2e: {
    video: true,
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
      on('after:spec', async (spec) => {
        await afterSpecHook(spec, config);
      });
      return config;
    },
  },
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
    testops: {
      api: { token: process.env.QASE_API_TOKEN },
      project: 'DEMO',
    },
    framework: {
      cypress: {
        videosFolder: 'cypress/videos',
      },
    },
  },
});
```

### Example 2: Test with Attachments

**Before (v2.3.x):**

```javascript
it(qase(1, 'Test with screenshot'), () => {
  cy.visit('https://example.com');
  cy.screenshot('my-screenshot');
  // Screenshot attached via Cypress integration
});
```

**After (v3.2.0):**

```javascript
it(qase(1, 'Test with screenshot and video'), () => {
  cy.visit('https://example.com');
  cy.screenshot('my-screenshot');
  // Screenshot AND video automatically attached
});
```

---

## Compatibility Notes

### Node.js Version Support

- **v3.9.0 and later:** Node.js 22, 24 or >= 26
- **v3.6.3 – v3.8.x:** Node.js >= 18
- **v3.6.2 and earlier:** Node.js >= 14

### Cypress Version Support

- **v3.9.0 and later:** Cypress >= 13.0.0 < 17.0.0
- **v3.2.0 – v3.8.x:** Cypress >= 10.0.0
- **v2.3.x:** Cypress >= 8.0.0

**Note:** Cypress 10+ uses the new configuration format with `setupNodeEvents`. If upgrading from Cypress 9 or earlier, you'll also need to migrate your Cypress configuration.

### Framework Compatibility

- CommonJS and ES Modules supported
- TypeScript support with full type definitions
- Works with Cypress Component Testing and E2E Testing
- Compatible with Cypress Cloud (formerly Dashboard)

---

## Troubleshooting

### Common Migration Issues

#### Issue: Videos not uploading to Qase

**Solution:**

1. Verify video recording is enabled: `video: true` in config
2. Check that `afterSpecHook` runs after each spec. Since 3.6.1 the plugin registers it; if you register `after:spec` yourself, call it there:
   ```javascript
   const { afterSpecHook } = require('cypress-qase-reporter/hooks');
   on('after:spec', async (spec) => {
     await afterSpecHook(spec, config);
   });
   ```
3. Set `framework.cypress.videosFolder` in the reporter options to the folder Cypress writes videos to (`videosFolder` in the Cypress config, `cypress/videos` by default)

#### Issue: Hook registration error

**Solution:** Ensure you're importing from the correct path:

```javascript
// Correct
const { afterSpecHook } = require('cypress-qase-reporter/hooks');

// Incorrect
const { afterSpecHook } = require('cypress-qase-reporter');
```

#### Issue: Configuration not recognized

**Solution:** Verify the `reporterOptions` structure includes the `TestOps` object:

```javascript
reporterOptions: {
  mode: 'testops',
  testops: {
    api: { token: 'token' },
    project: 'DEMO',
  },
}
```

#### Issue: Module not found after upgrade

**Solution:** Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Getting Help

If you encounter issues during migration:

1. Check the [GitHub Issues](https://github.com/qase-tms/qase-javascript/issues)
2. Review the CHANGELOG
3. Open a new issue with:
   - Previous version (e.g., 2.3.1)
   - Target version (3.2.0)
   - Cypress version
   - Error messages
   - Configuration file (without sensitive data)
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- CHANGELOG
- [Cypress Configuration Migration Guide](https://docs.cypress.io/guides/references/migration-guide)
