import { Test } from 'mocha';

export const qase = (
  caseId: number | string | number[] | string[],
  test: Test,
) => {
  const caseIds = Array.isArray(caseId) ? caseId : [caseId];

  test.title = `${test.title} (Qase ID: ${caseIds.join(',')})`;

  return test;
};

/**
 * Set a title for the test case
 * @param {string} value
 * @example
 * it('test', () => {
 *    qase.title("Title");
 *    cy.visit('https://example.com');
 * });
 */
qase.title = (
  value: string,
) => {
  cy.task('qaseTitle', value).then(() => {
    //
  });
};


/**
 * Set fields for the test case
 * @param {Record<string, string>} values
 * @example
 * it('test', () => {
 *    qase.fields({description: "Description"});
 *    cy.visit('https://example.com');
 * });
 */
qase.fields = (
  values: Record<string, string>,
) => {
  cy.task('qaseFields', values).then(() => {
    //
  });
};

/**
 * Ignore the test case result in Qase
 * @example
 * it('test', () => {
 *    qase.ignore();
 *    cy.visit('https://example.com');
 * });
 */
qase.ignore = () => {
  cy.task('qaseIgnore').then(() => {
    //
  });
};

/**
 * Set parameters for the test case
 * @param {Record<string, string>} values
 * @example
 * it('test', () => {
 *    qase.parameters({param01: "value01"});
 *    cy.visit('https://example.com');
 * });
 */
qase.parameters = (
  values: Record<string, string>,
) => {
  cy.task('qaseParameters', values).then(() => {
    //
  });
};

/**
 * Set group parameters for the test case
 * @param {Record<string, string>} values
 * @example
 * it('test', () => {
 *    qase.groupParameters({param01: "value01"});
 *    cy.visit('https://example.com');
 * });
 */
qase.groupParameters = (
  values: Record<string, string>,
) => {
  cy.task('qaseGroupParameters', values).then(() => {
    //
  });
};

/**
 * Set a suite for the test case
 * @param {string} value
 * @example
 * it('test', () => {
 *    qase.suite("Suite 01");
 *    cy.visit('https://example.com');
 * });
 */
qase.suite = (
  value: string,
) => {
  cy.task('qaseSuite', value).then(() => {
    //
  });
};

/**
 * Set a comment for the test case
 * @param {string} value
 * @example
 * it('test', () => {
 *    qase.comment("Some comment");
 *    cy.visit('https://example.com');
 * });
 */
qase.comment = (
  value: string,
) => {
  cy.task('qaseComment', value).then(() => {
    //
  });
};

/**
 * Add a step to  the test case
 * @param {string} name
 * @param {() => T | PromiseLike<T>} body
 * @example
 * it('test', () => {
 *    qase.step("Some step", () => {
 *      // some actions
 *    });
 *    cy.visit('https://example.com');
 * });
 */
qase.step = <T = void>(name: string, body: () => T | PromiseLike<T>) => {
  return cy.task('qaseStepStart', name).then(() => {
    return Cypress.Promise.resolve(body());
  }).then(() => {
    cy.task('qaseStepEnd', 'passed').then(() => {
      //
    });
  });
};
