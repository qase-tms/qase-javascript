# qase-mocha@1.1.3

## What's new

- Added support for status filter in the test run.
- Improved error handling.

# qase-mocha@1.1.0

## What's new

- Updated to the latest minor version of the common package for improved compatibility and features.
- Fixed all ESLint warnings across the project to ensure code quality and maintainability.
- Resolved an issue that prevented proper execution of async tests

# qase-mocha@1.0.2

## What's new

Enhanced handling of start and end times for tests and steps, ensuring greater accuracy in reporting.

# qase-mocha@1.0.0

## What's new

Major release of the Mocha reporter package

# qase-mocha@1.0.0-beta.5

## What's new

- Added a `qase` function to allow specifying QaseID for tests.
- Marked the old syntax for QaseID as deprecated.
- Implemented functionality to capture console logs and include them as attachments in tests.

# qase-mocha@1.0.0-beta.4

## What's new

Fixed the issue with async tests not being reported correctly.

# qase-mocha@1.0.0-beta.3

## What's new

Support group parameters for test cases. You can specify the group parameters in the test case using the following format: 

```ts
  it('test', () => {
    this.groupParameters({ param1: 'value1', param2: 'value2' });
    expect(true).to.equal(true);
  });
```

# qase-mocha@1.0.0-beta.2

## What's new

Support parallel execution of tests.

# qase-mocha@1.0.0-beta.1

## What's new

First major beta release for the version 1 series of the Qase Mocha reporter.
