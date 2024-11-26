# Cypress Example

This is a sample project demonstrating how to write and execute tests using the Cypress framework with integration to
Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-js/examples/cypress
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions
   on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

4. Run the Cypress tests locally:
   ```bash
   npx cypress open
   ```
   This will open the Cypress Test Runner, where you can manually execute tests.

5. To run tests and upload the results to Qase Test Management, use the following command:
   ```bash
   npx cypress run --env qaseApiToken=YOUR_QASE_API_TOKEN,qaseProjectCode=YOUR_PROJECT_CODE
   ```

   Replace `YOUR_QASE_API_TOKEN` and `YOUR_PROJECT_CODE` with your Qase API token and project code.

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Cypress documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress).
