/* eslint-disable no-console */

export const qase = <T>(caseId: number | string | number[] | string[], test: T): T => {
    if (!test) {
        return test;
    }
    const testNew = test as unknown as Record<string, string>;
    let caseIds: number[] | string[];
    if (typeof caseId === 'string' || typeof caseId === 'number') {
        caseIds = [caseId.toString()];
    } else {
        caseIds = caseId;
    }
    Object.assign(test, { title: `${testNew.title} (Qase ID: ${caseIds.join(',')})` });
    console.log(test);
    return test;
};

export const qaseTitle = (caseId: number | string | number[] | string[], name: string): string => {
    let caseIds: number[] | string[];
    if (typeof caseId === 'string' || typeof caseId === 'number') {
        caseIds = [caseId.toString()];
    } else {
        caseIds = caseId;
    }
    const newName = `${name} (Qase ID: ${caseIds.join(',')})`;
    return newName;
};
