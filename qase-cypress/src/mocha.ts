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
  return cy.task('qaseTitle', value).then(() => {
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
  return cy.task('qaseFields', values).then(() => {
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
  return cy.task('qaseIgnore').then(() => {
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
  return cy.task('qaseParameters', values).then(() => {
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
  return cy.task('qaseGroupParameters', values).then(() => {
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
  return cy.task('qaseSuite', value).then(() => {
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
  return cy.task('qaseComment', value).then(() => {
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

/**
 * Attach a file to the test case or the step
 * @param attach
 * @example
 * it('test', () => {
 *   qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
 *   qase.attach({ paths: '/path/to/file'});
 *   qase.attach({ paths: ['/path/to/file', '/path/to/another/file']});
 *   cy.visit('https://example.com');
 *  });
 */
qase.attach = (attach: {
  name?: string,
  paths?: string | string[],
  content?: Buffer | string,
  contentType?: string,
}) => {
  return cy.task('qaseAttach', attach).then(() => {
    //
  });
};
