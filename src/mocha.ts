/* eslint-disable no-console */
export = {
    qase: <T>(caseId: number | string | number[] | string[], test: T): T => {
        const testNew = test as unknown as Record<string,string>;
        let caseIds: number[] | string[];
        if (typeof caseId === 'string' || typeof caseId === 'number') {
            caseIds = [caseId.toString()];
        } else {
            caseIds = caseId;
        }
        Object.assign(test, { title: `${testNew.title} (Qase ID: ${caseIds.join(',')})` });
        console.log(test);
        return test;
    },
};
