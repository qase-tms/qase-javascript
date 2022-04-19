export = {
    qase: (caseId: number | string | number[] | string[], name: string): string => {
        let caseIds: number[] | string[];
        if (typeof caseId === 'string' || typeof caseId === 'number') {
            caseIds = [caseId.toString()];
        } else {
            caseIds = caseId;
        }
        const newName = `${name} (Qase ID: ${caseIds.join(',')})`;
        return newName;
    },
};
