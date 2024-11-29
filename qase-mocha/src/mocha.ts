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
