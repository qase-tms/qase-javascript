/* eslint-disable no-console */
export const qase = <T>(caseId: number, test: T): T => {
    if (!test) {
        return test;
    }
    const testNew = test as unknown as Record<string, string>;
    Object.assign(test, { title: testNew.title, testOpsId: caseId });
    return test;
};

export const qaseParam = (
    caseId: number | string | number[] | string[] | undefined | null,
    param: [number, Record<string, unknown> | string],
    name: string): string => {

    const [id, dataset] = param;
    const normalizedParam = typeof dataset === 'string' ? dataset : Object.keys(dataset)
        .map((key: string) => `${key}: ${dataset[key] as string}`).join(', ');

    const formattedDataset = `(Qase Dataset: #${id} (${normalizedParam}))`;

    let newName = `${name} ${formattedDataset}`;
    let caseIds: number[] | string[];

    if (caseId === null) {
        return newName;
    }

    if (typeof caseId === 'string' || typeof caseId === 'number') {
        caseIds = [caseId.toString()];
    } else {
        caseIds = caseId as number[] | string[];
    }

    newName = `${name} (Qase ID: ${caseIds.join(',')}) ${formattedDataset}`;
    return newName;
};