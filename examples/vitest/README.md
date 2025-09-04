# Vitest Example

This is a sample project demonstrating how to write and execute tests using the Vitest framework with integration to
Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:

   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-js/examples/vitest
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Configure your Qase project settings:
   - Update the API token in `vitest.config.ts`
   - Set the correct project name
   - Enable "Create test cases" option in your Qase project settings

4. To run tests and upload the results to Qase Test Management, use the following command:

   ```bash
   npm test
   ```

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Vitest documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-vitest).
