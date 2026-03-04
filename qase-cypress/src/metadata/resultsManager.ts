import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { TestResultType } from 'qase-javascript-commons';

export class ResultsManager {
    static resultsPath = path.resolve(__dirname, 'qaseResults');

    public static getResults(): TestResultType[] | undefined {
        if (!this.isExists()) {
            return undefined;
        }

        let results: TestResultType[] = [];

        try {
            results = JSON.parse(readFileSync(this.resultsPath, 'utf8')) as TestResultType[];
        } catch (error) {
            console.log('Error reading results file', error);
        }

        return results;
    }

    public static setResults(results: TestResultType[]) {
        try {
            writeFileSync(this.resultsPath, JSON.stringify(results));
        } catch (error) {
            console.log('Error writing results file', error);
        }
    }

    public static clear() {
        if (this.isExists()) {
            try {
                unlinkSync(this.resultsPath);
            } catch (error) {
                console.log('Error clearing results file', error);
            }
        }
    }

    private static isExists() {
        return existsSync(this.resultsPath);
    }
}
