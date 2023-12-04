/* eslint-disable no-console */
export = {
    qase: (caseId: number | string | number[] | string[], name: string, parameters?: object): string => {
        let caseIds: number[] | string[];
        if (typeof caseId === 'string' || typeof caseId === 'number') {
            caseIds = [caseId.toString()];
        } else {
            caseIds = caseId;
        }
        let parameterString = ``;
        if (typeof parameters === 'object') {
            parameterString = ` [Parameters: ${JSON.stringify(parameters)}]`;
        }
        const newName = `${name} (Qase ID: ${caseIds.join(',')}) ${parameterString}`
        return newName;
    },
};
