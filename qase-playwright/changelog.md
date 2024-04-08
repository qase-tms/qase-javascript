# playwright-qase-reporter@2.0.0-beta.4

## What's new

Annotate parameterized tests to see the complete data in the Qase.io test report:

```js
const people = ['Alice', 'Bob'];
for (const name of people) {
    test(`testing with ${name}`, async () => {
        qase.id(1)
        qase.parameters({ 'name': name });
        // ...
    });
}

```

# playwright-qase-reporter@2.0.0-beta.3

## What's new

*   Change module exports for simpler importing.

    New syntax:
    
    ```js
    import { qase } from 'playwright-qase-reporter';
    ```
    
    instead of:
    ```js
    import { qase } from 'playwright-qase-reporter/playwright';
    ```
    
* Update the readme with examples of new imports and annotations.


# playwright-qase-reporter@2.0.0-beta.2

## Overview
Qase reporter for the Playwright test framework.

This is a beta channel release.
To try the new features, install it with:

```bash
npm install playwright-qase-reporter@beta
```

To switch back to the stable releases, run:

```bash
npm install playwright-qase-reporter@latest
```

## What's new
### New syntax for annotating tests

This release brings a major syntax change for specifying more test parameters.

Old syntax allowed only test ID and title, and wasn't improving code readability:

```js
test(qase(42, 'Ultimate Question of Life, The Universe, and Everything'), async ({ page }) => {
    ...  
})
```

New syntax allows for adding information on separate lines, keeping the code readable:

```js
test('Ultimate Question of Life, The Universe, and Everything', async ({ page }) => {
    qase.id(42);
    qase.fields({ severity: high, priority: medium });
    qase.attach({ paths: '/path/to/file'});
    ...
})
```
