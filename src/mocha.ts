/* eslint-disable no-console */
export = {
    qase: <T>(caseId: number | string, test: T): T => {
        const testNew = test as unknown as Record<string,string>;
        Object.assign(test, { title: `${testNew.title} (Qase ID: ${caseId.toString()})` });
        console.log(test);
        return test;
    },
};
