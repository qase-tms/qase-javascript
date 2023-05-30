import { Test } from 'mocha';

export const qase = (caseId: number | string | number[] | string[], test: Test) => {
    const caseIds = Array.isArray(caseId) ? caseId : [caseId];

    test.title = `${test.title} (Qase ID: ${caseIds.join(',')})`;

    return test;
};
