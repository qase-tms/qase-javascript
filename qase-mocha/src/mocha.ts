import { formatTitleWithProjectMapping } from 'qase-javascript-commons';

/** Project code → test case IDs for multi-project (testops_multi) mode. */
export type ProjectMapping = Record<string, number[]>;

/**
 * Set IDs for the test case
 *
 * @param caseId
 * @param name
 * @example
 * it(qase(1, 'test'), function() => {
 *  // test code
 * });
 * @returns {string}
 */
export const qase = (
  caseId: number | string | number[] | string[],
  name: string,
): string => {
  const caseIds = Array.isArray(caseId) ? caseId : [caseId];
  const ids: number[] = [];

  for (const id of caseIds) {
    if (typeof id === 'number') {
      ids.push(id);
      continue;
    }

    const parsedId = parseInt(id);

    if (!isNaN(parsedId)) {
      ids.push(parsedId);
      continue;
    }

    console.log(`qase: qase ID ${id} should be a number`);
  }

  return `${name} (Qase ID: ${caseIds.join(',')})`;
};

/**
 * Build test name with multi-project markers (for testops_multi mode).
 * @param mapping — e.g. { PROJ1: [1, 2], PROJ2: [3] }
 * @param name — test title
 * @example it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'Login flow'), function() { ... });
 */
qase.projects = (mapping: ProjectMapping, name: string): string => {
  return formatTitleWithProjectMapping(name, mapping);
};
