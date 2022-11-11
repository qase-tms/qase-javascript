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
