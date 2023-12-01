/* eslint-disable no-console */
export = {
    qase: (caseId: number | string | number[] | string[], name: string, params?: object): string => {
        let caseIds: number[] | string[];
        if (typeof caseId === 'string' || typeof caseId === 'number') {
            caseIds = [caseId.toString()];
        } else {
            caseIds = caseId;
        }
        let parameters = {};
        if (typeof params === 'object') {
            parameters = params;
        }
        const newName = `${name} (Qase ID: ${caseIds.join(',')}) [Parameters: ${JSON.stringify(parameters)}]`
        return newName;
    },
};
