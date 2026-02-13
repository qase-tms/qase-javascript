# Template Usage Guide

This guide provides a comprehensive workflow for applying templates to JavaScript reporter documentation. Follow these steps to generate consistent, high-quality documentation for any of the 9 supported testing frameworks.

---

## Overview

**Purpose:** Standardize documentation across all JavaScript reporters (Jest, Playwright, Cypress, Mocha, Vitest, CucumberJS, Newman, TestCafe, WebdriverIO) using a template-based approach with placeholder replacement.

**Audience:** Maintainers and contributors applying templates to create or update framework-specific documentation.

**Scope:** Complete workflow from template selection through validation and publishing.

**Foundation components:**
- 6 master templates in `.planning/templates/`
- Placeholder validation script in `.planning/tools/`
- Framework variations reference in `.planning/docs/`
- Code style guide in `.planning/docs/`

---

## Template Inventory

All templates use `{{PLACEHOLDER}}` syntax for framework-specific content:

| Template File | Target Location | Purpose | Lines |
|--------------|-----------------|---------|-------|
| `README-TEMPLATE.md` | `{package}/README.md` | Main package documentation with installation, configuration, and quick start | 149 |
| `usage-TEMPLATE.md` | `{package}/docs/usage.md` | Detailed usage guide with comprehensive API examples | 249 |
| `ATTACHMENTS-TEMPLATE.md` | `{package}/docs/ATTACHMENTS.md` | Attachments feature guide with file and content-based examples | 164 |
| `STEPS-TEMPLATE.md` | `{package}/docs/STEPS.md` | Test steps feature guide with async patterns | 191 |
| `UPGRADE-TEMPLATE.md` | `{package}/docs/UPGRADE.md` | Version migration guide with breaking changes | 176 |
| `MULTI_PROJECT-TEMPLATE.md` | `{package}/docs/MULTI_PROJECT.md` | Multi-project support guide | 113 |

**Total:** 6 templates covering all aspects of reporter documentation.

**Note:** Package name format is `{framework}-qase-reporter` (e.g., `jest-qase-reporter`, `playwright-qase-reporter`).

---

## Step-by-Step Application Workflow

### Step 1: Gather Framework Information

Before starting, collect all framework-specific information needed for placeholder replacement:

**From PLACEHOLDER-REFERENCE.md:**
- `{{FRAMEWORK_NAME}}` - Display name (Jest, Playwright, Cypress, etc.)
- `{{PACKAGE_NAME}}` - npm package name (`jest-qase-reporter`, etc.)
- `{{FRAMEWORK_VERSION}}` - Minimum supported version
- `{{NODE_VERSION}}` - Node.js requirement (typically 14 or 16)
- `{{FRAMEWORK_SLUG}}` - URL-safe identifier (jest, playwright, cypress, etc.)

**From FRAMEWORK-VARIATIONS.md:**
- Import patterns (CommonJS vs ES modules)
- Test ID linking syntax (wrapper function, method, tags)
- Steps API patterns (async vs sync)
- Attachments API usage
- Configuration file location and format
- Run commands

**From examples directory:**
- Working code examples: `examples/single/{framework}/`
- Integration patterns from existing implementations
- Actual API method signatures and parameters

**Cross-reference:**
- Review existing package README if updating (e.g., `qase-jest/README.md`)
- Check package.json for current version and dependencies
- Verify Node.js version requirement from package engines field

---

### Step 2: Copy Template Files

Create documentation directory structure and copy all templates:

```bash
# Example for Jest
FRAMEWORK="jest"
PACKAGE="qase-${FRAMEWORK}"

# Copy main README
cp .planning/templates/README-TEMPLATE.md ${PACKAGE}/README.md

# Create docs directory if it doesn't exist
mkdir -p ${PACKAGE}/docs

# Copy all feature documentation templates
cp .planning/templates/usage-TEMPLATE.md ${PACKAGE}/docs/usage.md
cp .planning/templates/ATTACHMENTS-TEMPLATE.md ${PACKAGE}/docs/ATTACHMENTS.md
cp .planning/templates/STEPS-TEMPLATE.md ${PACKAGE}/docs/STEPS.md
cp .planning/templates/UPGRADE-TEMPLATE.md ${PACKAGE}/docs/UPGRADE.md
cp .planning/templates/MULTI_PROJECT-TEMPLATE.md ${PACKAGE}/docs/MULTI_PROJECT.md
```

**Result:** All 6 template files copied to package directory with proper paths.

---

### Step 3: Replace Common Placeholders

Replace framework identification placeholders using find-and-replace:

**Method A: Using sed (Unix/macOS):**
```bash
# Navigate to package directory
cd qase-jest

# Replace FRAMEWORK_NAME
sed -i '' 's/{{FRAMEWORK_NAME}}/Jest/g' README.md docs/*.md

# Replace PACKAGE_NAME
sed -i '' 's/{{PACKAGE_NAME}}/jest-qase-reporter/g' README.md docs/*.md

# Replace FRAMEWORK_VERSION
sed -i '' 's/{{FRAMEWORK_VERSION}}/28.0.0/g' README.md docs/*.md

# Replace NODE_VERSION
sed -i '' 's/{{NODE_VERSION}}/14/g' README.md docs/*.md

# Replace FRAMEWORK_SLUG
sed -i '' 's/{{FRAMEWORK_SLUG}}/jest/g' README.md docs/*.md
```

**Method B: Using editor find-and-replace:**
- Open all copied files in your editor (VS Code, etc.)
- Use global find-and-replace (Cmd/Ctrl + Shift + H)
- Replace each placeholder one at a time
- Review each replacement before confirming

**Tip:** Use Method A for bulk replacement, then Method B for verification and edge cases.

---

### Step 4: Replace Code Example Placeholders

Replace code-specific placeholders with actual working examples. Consult FRAMEWORK-VARIATIONS.md for syntax and examples/ directory for tested code.

#### Import Statements

**{{IMPORT_STATEMENT}}** - Framework-specific import syntax:

```javascript
// Jest (CommonJS preferred, ESM supported)
const { qase } = require('jest-qase-reporter/jest');

// Playwright (ES modules preferred)
import { qase } from 'playwright-qase-reporter';

// Cypress (CommonJS with /mocha subpath)
const { qase } = require('cypress-qase-reporter/mocha');

// Mocha
const { qase } = require('mocha-qase-reporter/mocha');

// Vitest (ES modules)
import { qase } from 'vitest-qase-reporter';
```

**Note:** Show both CommonJS and ES modules if framework supports both.

#### Quick Start Examples

**{{QUICK_START_TEST_EXAMPLE}}** - Minimal test with QaseID:

```javascript
// Jest/Vitest pattern
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'User can login'), () => {
  expect(true).toBe(true);
});

// Playwright pattern
import { qase } from 'playwright-qase-reporter';

test(qase(1, 'User can login'), async ({ page }) => {
  await page.goto('https://example.com');
  expect(await page.title()).toBe('Example');
});

// Cypress pattern
const { qase } = require('cypress-qase-reporter/mocha');

it(qase(1, 'User can login'), () => {
  cy.visit('https://example.com');
  cy.title().should('eq', 'Example');
});
```

#### Test ID Linking

**{{LINK_TESTS_EXAMPLE}}** - Multiple test cases with single/multiple IDs:

```javascript
// Single ID
test(qase(1, 'Test name'), () => {
  // Test logic
});

// Multiple IDs
test(qase([1, 2, 3], 'Test covering multiple cases'), () => {
  // Test logic
});
```

#### Metadata Examples

**{{METADATA_EXAMPLE}}** - Fields, title, suite:

```javascript
test(qase(1, 'Test with metadata'), () => {
  qase.title('Custom descriptive title');
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'api',
  });
  qase.suite('Authentication / Login');

  // Test logic
});
```

#### Steps Examples

**{{STEP_ASYNC_EXAMPLE}}** - Async step pattern (Jest, Playwright, Vitest):

```javascript
test('Test with steps', async () => {
  await qase.step('Initialize environment', async () => {
    // Setup code
  });

  await qase.step('Execute main test', async () => {
    // Test logic
  });

  await qase.step('Verify results', async () => {
    // Assertions
  });
});
```

**For Cypress/Mocha (synchronous):**

```javascript
it('Test with steps', () => {
  qase.step('Step 1', () => {
    // Synchronous code
  });

  qase.step('Step 2', () => {
    // More code
  });
});
```

#### Attachments Examples

**{{ATTACH_FILE_PATH_EXAMPLE}}** - Path-based attachment:

```javascript
qase.attach({ paths: '/path/to/file.txt' });
qase.attach({ paths: ['/file1.txt', '/file2.log'] });
```

**{{ATTACH_BINARY_CONTENT_EXAMPLE}}** - Screenshot/binary content:

```javascript
// Playwright
const screenshot = await page.screenshot();
qase.attach({
  name: 'screenshot.png',
  content: screenshot,
  contentType: 'image/png',
});

// Jest with Buffer
qase.attach({
  name: 'screenshot.png',
  content: Buffer.from(imageData, 'base64'),
  contentType: 'image/png',
});
```

#### Status Mapping Table

**{{STATUS_TABLE}}** - Framework-to-Qase status mapping:

```markdown
| Framework Status | Qase Status |
|-----------------|-------------|
| passed          | passed      |
| failed          | failed      |
| skipped         | skipped     |
```

**Adjust table based on framework status values.**

#### Run Commands

**{{RUNNING_TESTS_EXAMPLES}}** - Framework-specific execution:

```bash
# Jest
npx jest
QASE_MODE=testops npx jest

# Playwright
npx playwright test

# Cypress
npx cypress run
```

**Reference CODE-STYLE-GUIDE.md for formatting** - ensure 2-space indentation, single quotes, async/await patterns.

---

### Step 5: Add Framework-Specific Content

Some frameworks have unique integration patterns that require custom sections:

#### Playwright-Specific

- **Test fixtures:** Document `{ page }` fixture parameter
- **Multiple ID linking methods:** Wrapper, method call, annotation
- **Native test.step() vs qase.step():** Explain differences

```typescript
// Playwright annotation pattern
test('Test name', async ({ page }) => {
  qase.id(1);
  qase.title('Custom title');
  qase.fields({ severity: 'high' });

  await page.goto('https://example.com');
});
```

#### Cypress-Specific

- **Plugin setup:** Document `setupNodeEvents` configuration
- **Mocha integration:** Explain Mocha-based structure
- **Cypress commands:** Show integration with `cy.visit()`, `cy.get()`, etc.

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
});
```

#### CucumberJS-Specific

- **Gherkin tags:** Use `@QaseID=N` instead of programmatic API
- **Hooks integration:** Document Before/After hook usage
- **Feature files:** Show complete feature file example

```gherkin
Feature: Login functionality

  @QaseID=1
  @QaseFields={'severity':'critical'}
  Scenario: User can login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard
```

**Consult FRAMEWORK-VARIATIONS.md** for complete framework-specific patterns.

---

### Step 6: Review and Adjust

Perform thorough review before validation:

**Remove inapplicable sections:**
- If framework doesn't support async steps, remove async examples
- If framework uses tags (Cucumber), remove programmatic API sections
- If framework has no screenshot API, adjust attachment examples

**Verify code syntax:**
- Run examples through framework to confirm they work
- Check imports match actual package exports
- Ensure async/await used correctly

**Check internal links:**
- README → docs/usage.md
- README → docs/ATTACHMENTS.md
- README → docs/STEPS.md
- README → docs/MULTI_PROJECT.md
- usage.md → other feature docs

**Verify external links:**
- Links to Qase documentation: https://help.qase.io
- Links to framework documentation
- Links to GitHub repository

**Ensure consistent terminology:**
- "Test case" (not "test", unless referring to code)
- "Qase ID" (capitalized)
- "reporter" (lowercase, not "Reporter")
- "Test run" (not "testrun" or "test-run")

**Apply CODE-STYLE-GUIDE.md:**
- 2-space indentation
- Single quotes for strings
- Async/await (not callbacks)
- Trailing commas in objects/arrays
- Meaningful test names

---

### Step 7: Validate

Run placeholder validation to ensure no unreplaced placeholders remain:

```bash
# Validate single file
node .planning/tools/validate-placeholders.js qase-jest/README.md

# Validate entire package
node .planning/tools/validate-placeholders.js qase-jest/

# Expected output for complete documentation
# "No unreplaced placeholders found"
# Exit code: 0
```

**If validation fails:**

```
qase-jest/README.md:42: Found unreplaced placeholder: {{FRAMEWORK_INTEGRATION_DETAILS}}
qase-jest/docs/usage.md:15: Found unreplaced placeholder: {{CONFIG_LOCATION}}

Found 2 unreplaced placeholders in 2 files
```

**Action:** Review each remaining placeholder:
- Is it in a conditional section that should be removed?
- Is it a new placeholder not in PLACEHOLDER-REFERENCE.md?
- Did search-and-replace miss it (case sensitivity, whitespace)?

**Fix all placeholders** and re-run validation until exit code is 0.

---

### Step 8: Test Code Examples

Verify examples work with actual framework:

**Create test file with documentation examples:**

```bash
# Create test file with examples from documentation
cat > qase-jest/test-docs-examples.test.js <<'EOF'
const { qase } = require('jest-qase-reporter/jest');

describe('Documentation Examples', () => {
  test(qase(1, 'Quick start example'), () => {
    expect(true).toBe(true);
  });

  test('Steps example', async () => {
    await qase.step('Step 1', async () => {
      expect(1).toBe(1);
    });
  });
});
EOF

# Run test to verify syntax
npx jest test-docs-examples.test.js

# Clean up
rm qase-jest/test-docs-examples.test.js
```

**Verify:**
- Code runs without syntax errors
- Imports resolve correctly
- API methods exist and work as documented
- Async/await patterns execute properly

**If errors found:**
- Correct documentation to match actual API
- Update examples to use correct method signatures
- Fix imports or module paths

---

## Framework-Specific Considerations

### Jest

**Pattern:** Wrapper function for test IDs
**Import:** `require('jest-qase-reporter/jest')`
**Config:** `jest.config.js` reporters array
**Steps:** Async required: `await qase.step(...)`
**Module system:** CommonJS preferred, ESM supported

**Key considerations:**
- Show both `test()` and `it()` syntax (Jest supports both)
- Document async/await for steps
- Include jest.config.js configuration example
- Reference examples/single/jest/ for working patterns

---

### Playwright

**Pattern:** Multiple patterns (wrapper, method, annotation)
**Import:** `import { qase } from 'playwright-qase-reporter'`
**Config:** `playwright.config.ts` reporter array
**Steps:** Async required: `await qase.step(...)`
**Module system:** ES modules preferred

**Key considerations:**
- Document all three ID linking methods (flexibility)
- Show TypeScript examples with proper types
- Document test fixtures (`{ page }` parameter)
- Explain difference between `test.step()` and `qase.step()`
- Show screenshot attachment with `await page.screenshot()`

---

### Cypress

**Pattern:** Mocha-style wrapper with Cypress commands
**Import:** `require('cypress-qase-reporter/mocha')`
**Config:** `cypress.config.js` with setupNodeEvents
**Steps:** Synchronous: `qase.step('name', () => {})`
**Module system:** CommonJS/ESM

**Key considerations:**
- Document plugin and metadata setup in cypress.config.js
- Show Mocha `describe`/`it` structure
- Steps work synchronously with Cypress commands
- Document automatic screenshot attachment if configured
- Reference /mocha subpath in import

---

### Mocha

**Pattern:** Wrapper function (similar to Jest)
**Import:** `require('mocha-qase-reporter/mocha')`
**Config:** `.mocharc.js` reporters array
**Steps:** Can be sync or async depending on test
**Module system:** CommonJS/ESM

**Key considerations:**
- Similar to Jest but with Mocha `describe`/`it`
- Show .mocharc.js configuration format
- Document both sync and async patterns
- Reference /mocha subpath in import

---

### Vitest

**Pattern:** Jest-compatible API
**Import:** `import { qase } from 'vitest-qase-reporter'`
**Config:** `vitest.config.ts` test.reporters array
**Steps:** Async required: `await qase.step(...)`
**Module system:** ES modules preferred

**Key considerations:**
- Nearly identical to Jest API
- Modern ES modules syntax
- Show vitest.config.ts configuration
- Reference Vitest-specific features if applicable

---

### CucumberJS

**Pattern:** Gherkin tag-based (no programmatic API)
**Import:** N/A (uses tags in feature files)
**Config:** `qase.config.json` or environment variables
**Steps:** Native Gherkin Given/When/Then
**Module system:** ES modules

**Key considerations:**
- Document `@QaseID=N` tag syntax
- Show `@QaseFields={...}` JSON tag format
- No need for qase import in step definitions
- Feature files use Gherkin syntax exclusively
- Formatter flag: `npx cucumber-js -f cucumberjs-qase-reporter`

---

### Newman

**Pattern:** Postman collection scripting
**Import:** N/A (uses pm.test in Postman)
**Config:** CLI flags or qase.config.json
**Steps:** TBD - Phase 3 documentation
**Module system:** N/A

**Key considerations:**
- Document reporter flag: `npx newman run collection.json -r qase`
- Show pm.test() usage in Postman scripts
- Phase 3 will complete full patterns

---

### TestCafe

**Pattern:** TBD - Phase 3 documentation
**Key considerations:** Will be documented in Phase 3

---

### WebdriverIO (WDIO)

**Pattern:** TBD - Phase 3 documentation
**Key considerations:** Will be documented in Phase 3

---

## Common Patterns and Shortcuts

### Bulk Placeholder Replacement

**Replace all common placeholders in one command:**

```bash
# Set framework variables
FRAMEWORK_NAME="Jest"
PACKAGE_NAME="jest-qase-reporter"
FRAMEWORK_VERSION="28.0.0"
NODE_VERSION="14"
FRAMEWORK_SLUG="jest"

# Bulk replace in all markdown files
cd qase-jest
find . -name "*.md" -type f -exec sed -i '' \
  -e "s/{{FRAMEWORK_NAME}}/${FRAMEWORK_NAME}/g" \
  -e "s/{{PACKAGE_NAME}}/${PACKAGE_NAME}/g" \
  -e "s/{{FRAMEWORK_VERSION}}/${FRAMEWORK_VERSION}/g" \
  -e "s/{{NODE_VERSION}}/${NODE_VERSION}/g" \
  -e "s/{{FRAMEWORK_SLUG}}/${FRAMEWORK_SLUG}/g" \
  {} \;
```

### Reusing Examples Across Similar Frameworks

**Jest, Vitest, and Mocha share similar patterns:**
- Same qase() wrapper function
- Similar test structure
- Same metadata methods

**Playwright and TestCafe may share patterns:**
- Modern async/await approach
- TypeScript-first

**Tip:** After documenting Jest, use it as reference for Vitest. Copy examples and adjust import paths and config file names.

### When to Create Framework-Specific Examples

**Create unique examples when:**
- Framework has unique syntax (Cucumber Gherkin)
- API pattern differs significantly (Playwright annotations)
- Integration requires special setup (Cypress plugin)
- Framework-specific features exist (Playwright fixtures)

**Reuse shared patterns when:**
- Core API is identical (qase.title, qase.fields)
- Only import path differs
- Test structure is similar (wrapper function pattern)

---

## Quality Checklist

Before completing documentation for a framework, verify:

**Templates:**
- [ ] All 6 templates applied to package
- [ ] README.md in package root
- [ ] docs/ directory with 5 feature guides

**Placeholders:**
- [ ] All `{{PLACEHOLDERS}}` replaced
- [ ] Validation script passes with exit code 0
- [ ] No remaining `{{` or `}}` in files

**Code Examples:**
- [ ] Import statements match actual package exports
- [ ] Code examples follow CODE-STYLE-GUIDE.md
- [ ] Examples tested and confirmed working
- [ ] Async/await used correctly for framework
- [ ] 2-space indentation throughout
- [ ] Single quotes for strings

**Links:**
- [ ] Internal links tested (README → docs/)
- [ ] External links valid (Qase documentation)
- [ ] Relative paths correct
- [ ] No broken links

**Content:**
- [ ] Framework-specific sections added where needed
- [ ] Inapplicable sections removed
- [ ] Configuration examples accurate
- [ ] Run commands correct
- [ ] Status mapping table accurate

**Style:**
- [ ] Consistent terminology used
- [ ] Proper capitalization (Qase ID, Test case, etc.)
- [ ] Code blocks have language specifiers
- [ ] Examples are complete and runnable
- [ ] Comments add value (not redundant)

**Verification:**
- [ ] Examples verified against examples/ directory
- [ ] API methods match actual package API
- [ ] Configuration tested with framework
- [ ] No Python syntax remains

---

## Troubleshooting

### Issue: Placeholder validation fails after replacement

**Symptoms:** Script reports unreplaced placeholders despite manual replacement

**Possible causes:**
- Case sensitivity mismatch ({{placeholder}} vs {{PLACEHOLDER}})
- Extra whitespace inside braces ({{ PLACEHOLDER }})
- Special characters in placeholder name
- Placeholder in conditional section that should be removed

**Solution:**
```bash
# Search for any remaining double braces
grep -r "{{" qase-jest/

# Check for whitespace variations
grep -r "{{ " qase-jest/
grep -r " }}" qase-jest/

# Remove conditional sections that don't apply
# Example: <!-- JEST_ONLY --> ... <!-- END_JEST_ONLY -->
```

---

### Issue: Code examples don't match actual API

**Symptoms:** Examples shown in documentation don't work when users try them

**Possible causes:**
- Documentation based on outdated API version
- Import path incorrect
- Method signature changed
- Framework version compatibility

**Solution:**
```bash
# Verify API by checking actual package exports
cd qase-jest
node -e "console.log(require('./jest'))"

# Test example directly
node -e "const { qase } = require('./jest'); console.log(typeof qase.step)"

# Cross-reference with examples directory
cat examples/single/jest/test/steps.test.js

# Update documentation to match actual API
```

---

### Issue: Framework-specific pattern unclear

**Symptoms:** Unsure which syntax variation to use for a framework

**Solution:**
1. Consult FRAMEWORK-VARIATIONS.md for documented patterns
2. Check examples/single/{framework}/ for working code
3. Review existing README if updating (e.g., qase-jest/README.md)
4. Test pattern in small test file before documenting
5. If pattern not documented, document it first before proceeding

---

### Issue: Validation script reports false positives

**Symptoms:** Script finds placeholders in template files themselves

**Cause:** Validation script scanning .planning/ directory

**Solution:**
Validation script excludes .planning/ by default. If you encounter this:

```bash
# Validate specific directory only (not .planning/)
node .planning/tools/validate-placeholders.js qase-jest/

# Never run on .planning/ templates
# (They intentionally contain placeholders)
```

---

### Issue: Import path not resolving

**Symptoms:** `Cannot find module 'jest-qase-reporter/jest'`

**Possible causes:**
- Subpath export not configured in package.json
- Import path doesn't match exports field
- Using wrong module system (CommonJS vs ESM)

**Solution:**
```bash
# Check package.json exports field
cat qase-jest/package.json | grep -A 10 '"exports"'

# Verify subpath exports exist
# Should see: "./jest": "./jest/index.js" or similar

# Test import
node -e "require('jest-qase-reporter/jest')"

# Update documentation to use correct path
```

---

## Maintenance

### When Templates Are Updated

**Scenario:** Master templates in `.planning/templates/` are updated with new features or corrections.

**Process:**
1. Identify which frameworks need re-application
2. For each framework:
   - Back up current documentation
   - Re-apply updated template sections
   - Preserve framework-specific customizations
   - Re-run validation
3. Update PLACEHOLDER-REFERENCE.md if new placeholders added
4. Update FRAMEWORK-VARIATIONS.md if patterns changed
5. Re-test examples in updated documentation

---

### When New Framework Added

**Scenario:** Adding support for a new testing framework (e.g., Jasmine).

**Process:**
1. Research framework integration patterns
2. Create working examples in examples/single/{framework}/
3. Document patterns in FRAMEWORK-VARIATIONS.md
4. Add new framework row to all comparison tables
5. Follow this guide to apply templates
6. Add framework-specific considerations section to this guide
7. Validate and test thoroughly

---

### Keeping Documentation Current

**Regular maintenance tasks:**
- Review documentation quarterly for accuracy
- Update examples when framework versions change
- Refresh status mapping tables if framework changes status names
- Update configuration examples for new options
- Verify all external links still valid
- Ensure CODE-STYLE-GUIDE.md compliance

---

## Summary

This guide provides a complete workflow for generating consistent, high-quality documentation across all JavaScript reporter frameworks:

1. **Gather information** from PLACEHOLDER-REFERENCE.md, FRAMEWORK-VARIATIONS.md, and examples
2. **Copy templates** to package directory structure
3. **Replace common placeholders** using bulk find-and-replace
4. **Replace code placeholders** with working framework-specific examples
5. **Add framework-specific content** for unique integration patterns
6. **Review and adjust** for accuracy and consistency
7. **Validate** using placeholder detection script
8. **Test examples** to confirm they work

**Key resources:**
- **PLACEHOLDER-REFERENCE.md** - Complete placeholder catalog
- **FRAMEWORK-VARIATIONS.md** - API syntax differences across frameworks
- **CODE-STYLE-GUIDE.md** - Formatting standards for examples
- **validate-placeholders.js** - Automated quality checks
- **examples/** - Working code to reference

By following this workflow and using these foundation components, you can confidently generate complete, accurate documentation for any JavaScript testing framework in the Qase reporter ecosystem.
