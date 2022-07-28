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
    qaseParam: (caseId: number | string | number[] | string[], param: [number, Object | string], name: string): string => {

        const [id, dataset] = param;
        const normalizedParam = typeof dataset === "string" ? dataset : Object.keys(dataset)
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
            caseIds = caseId;
        }

        newName = `${name} (Qase ID: ${caseIds.join(',')}) ${formattedDataset}`;
        return newName;
    },
};
