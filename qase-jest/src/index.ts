/* eslint-disable camelcase */
import { AssertionResult, Status } from '@jest/test-result';
import { IdResponse, ResultCreateStatusEnum, ResultCreateStepsStatusEnum, SuiteCreate } from 'qaseio/dist/src';
import { Reporter, Test, TestResult } from '@jest/reporters';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';

enum Envs {
    report = 'QASE_REPORT',
    apiToken = 'QASE_API_TOKEN',
    basePath = 'QASE_BASE_PATH',
    projectCode = 'QASE_PROJECT_CODE',
    runId = 'QASE_RUN_ID',
    runName = 'QASE_RUN_NAME',
    runDescription = 'QASE_RUN_DESCRIPTION',
    runComplete = 'QASE_RUN_COMPLETE',
    environmentId = 'QASE_ENVIRONMENT_ID',
}

const Statuses = {
    passed: ResultCreateStatusEnum.PASSED,
    failed: ResultCreateStatusEnum.FAILED,
    skipped: ResultCreateStatusEnum.SKIPPED,
    pending: ResultCreateStatusEnum.SKIPPED,
    disabled: ResultCreateStatusEnum.BLOCKED,
};

class ResultStepCreate {
    public position: number;
    public status: ResultCreateStepsStatusEnum;
    public attachments: string[] | undefined;
    public comment?: string | undefined;
    public constructor(
        position: number, status: ResultCreateStepsStatusEnum, attachments?: string[], comment?: string | undefined) {
        this.position = position;
        this.status = status;
        this.attachments = attachments;
        this.comment = comment;
    }
}

class ResultCreate {
    public case_id: number;
    public status: ResultCreateStatusEnum;
    public time_ms?: number;
    public member_id?: number;
    public comment?: string;
    public stacktrace?: string;
    public defect?: boolean;
    public steps?: ResultStepCreate[];
    public attachments?: string[];
    public constructor(case_id: number, status: ResultCreateStatusEnum, args?: {
        time_ms?: number;
        member_id?: number;
        comment?: string;
        stacktrace?: string;
        defect?: boolean;
        steps?: ResultStepCreate[];
        attachments?: string[];
    }) {
        this.case_id = case_id;
        this.status = status;
        this.time_ms = args?.time_ms;
        this.member_id = args?.member_id;
        this.comment = args?.comment;
        this.stacktrace = args?.stacktrace;
        this.defect = args?.defect;
        this.steps = args?.steps;
        this.attachments = args?.attachments;
    }
}

interface QaseOptions {
    apiToken: string;
    basePath: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
}

interface PreparedForReportingTestCase {
    path: string;
    result: Status;
    duration: number | null | undefined;
    status: Status;
    title: string;
    failureMessages: string[];
}

interface TestSuitePath {
    id: number;
    title: string;
    parentId: number | null;
    parentTitle?: string;
    parentPath?: string;
}

interface TestCasePath {
    id: number;
    title: string;
    suiteId: number | null;
}

interface SimplefiedTestCase { title: string | undefined; id: number | undefined; suiteId: number | null | undefined }
interface SimplefiedTestSuit { title: string | undefined; id: number | undefined; parentId: number | null | undefined }
interface SuitesHashMapByPath { [key: string]: SimplefiedTestSuit }
interface SuitesHashMapBySuiteId { [key: number]: SimplefiedTestSuit }
interface CasesHashMapByPath { [key: string]: SimplefiedTestCase }
interface CasesHashMapById { [key: number]: SimplefiedTestCase }

const alwaysUndefined = () => undefined;

class QaseReporter implements Reporter {
    private api: QaseApi;
    private options: QaseOptions;
    private runId?: number | string;
    private isDisabled = false;
    private publishedResultsCount = 0;
    private preparedTestCases: PreparedForReportingTestCase[];
    private casesArray: SimplefiedTestCase[];
    private suitesArray: SimplefiedTestSuit[];
    private suitesHashMapByPath: SuitesHashMapByPath;
    private suitesHashMapBySuitId: SuitesHashMapBySuiteId;
    private casesHashMapByPath: CasesHashMapByPath;
    private casesHashMapById: CasesHashMapById;

    public constructor(_: Record<string, unknown>, _options: QaseOptions) {
        this.options = _options;
        this.options.projectCode = _options.projectCode || this.getEnv(Envs.projectCode) || '';
        this.options.runComplete = !!this.getEnv(Envs.runComplete) || this.options.runComplete;
        this.api = new QaseApi(
            this.getEnv(Envs.apiToken) || this.options.apiToken || '',
            this.getEnv(Envs.basePath) || this.options.basePath
        );

        this.log(chalk`{yellow Current PID: ${process.pid}}`);
        this.preparedTestCases = [];
        this.casesArray = [];
        this.suitesArray = [];
        this.suitesHashMapBySuitId = {};
        this.suitesHashMapByPath = {};
        this.casesHashMapById = {};
        this.casesHashMapByPath = {};

        if (!this.getEnv(Envs.report)) {
            this.log(chalk`{yellow QASE_REPORT env variable is not set. Reporting to qase.io is disabled.}`);
            this.isDisabled = true;
            return;
        }
    }

    public async onRunStart(): Promise<void> {
        if (this.isDisabled) {
            return;
        }

        return this.checkProject(
            this.options.projectCode,
            async (prjExists): Promise<void> => {
                if (!prjExists) {
                    this.log(chalk`{red Project ${this.options.projectCode} does not exist}`);
                    this.isDisabled = true;
                    return;
                }

                this.log(chalk`{green Project ${this.options.projectCode} exists}`);
                const userDefinedRunId = this.getEnv(Envs.runId) || this.options.runId;
                if (userDefinedRunId) {
                    this.runId = userDefinedRunId;
                    return this.checkRun(
                        this.runId,
                        (runExists: boolean) => {
                            if (runExists) {
                                this.log(chalk`{green Using run ${this.runId} to publish test results}`);
                            } else {
                                this.log(chalk`{red Run ${this.runId} does not exist}`);
                                this.isDisabled = true;
                            }
                        }
                    );
                } else {
                    return this.createRun(
                        this.getEnv(Envs.runName),
                        this.getEnv(Envs.runDescription),
                        (created) => {
                            if (created) {
                                this.runId = created.result?.id;
                                process.env.QASE_RUN_ID = this.runId!.toString();
                                this.log(chalk`{green Using run ${this.runId} to publish test results}`);
                            } else {
                                this.log(chalk`{red Could not create run in project ${this.options.projectCode}}`);
                                this.isDisabled = true;
                            }
                        }
                    );
                }
            }
        );
    }

    public async onTestResult(_test: Test, testResult: TestResult): Promise<void> {
        if (this.isDisabled) {
            return;
        }
        this.preparedTestCases = this.transformResultsToMap(testResult.testResults);

        await this.publishTestResults().then(alwaysUndefined);
    }

    public async onRunComplete(): Promise<void> {
        if (this.isDisabled) {
            return;
        }

        if (this.publishedResultsCount === 0) {
            this.log('No testcases were matched. Ensure that your tests are declared correctly.');
            return;
        }

        if (!this.options.runComplete) {
            return;
        }

        try {
            await this.api.runs.completeRun(this.options.projectCode, Number(this.runId));
            this.log(chalk`{green Run ${this.runId} completed}`);
        } catch (err) {
            this.log(`Error on completing run ${err as string}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public getLastError(): void { }

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging) {
            // eslint-disable-next-line no-console
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private getEnv(name: Envs) {
        return process.env[name];
    }

    private getCaseIds(test: AssertionResult): number[] {
        const regexp = /(\(Qase ID: ([\d,]+)\))/;
        const results = regexp.exec(test.title);
        if (results && results.length === 3) {
            return results[2].split(',').map((value) => Number.parseInt(value, 10));
        }
        return [];
    }

    private logTestItem(test: PreparedForReportingTestCase) {
        const map = {
            failed: chalk`{red Test ${test.title} ${test.status}}`,
            passed: chalk`{green Test ${test.title} ${test.status}}`,
            skipped: chalk`{blueBright Test ${test.title} ${test.status}}`,
            pending: chalk`{blueBright Test ${test.title} ${test.status}}`,
            disabled: chalk`{gray Test ${test.title} ${test.status}}`,
        };
        if (test.status) {
            this.log(map[test.status]);
        }
    }

    private transformResultsToMap(testResults: AssertionResult[]) {
        const transformedMap = testResults.map((result) => {
            const item = {
                path: result.ancestorTitles.join('/'),
                result: result.status,
                duration: result.duration,
                status: result.status,
                title: result.title,
                failureMessages: result.failureMessages,
            };

            return item;
        });

        return transformedMap;
    }

    private async publishTestResults() {
        // Create an array of unique testcase pathes;
        const testPathesSet: Set<string> = new Set();
        this.preparedTestCases.map((elem) => testPathesSet.add(elem.path));
        // Create an array of unique testsuit pathes for cases. Ex. 'foo/bar/baz'
        const uniqueTestcasePathes = Array.from(testPathesSet);
        const testPathes = uniqueTestcasePathes.map((elem) => {
            const splitedPathesArray = elem.split('/');
            const pathesTree: Array<{ title: string; parent: null | string }> = [];
            splitedPathesArray.forEach((leaf, index) => {
                const newPathObject = {
                    title: index === 0 ? leaf : `${pathesTree[index - 1].title}/${leaf}`,
                    parent: index === 0 ? null : pathesTree[index - 1].title,
                };
                pathesTree.push(newPathObject);
            });
            return pathesTree;
        })
            .reduce((accum, value) => {
                accum.push(...value);
                return accum;
            }, [] as Array<{ title: string; parent: null | string }>);

        // Filter testcase pathes to create only non-existing in Qase suites
        const filterdTestPathes = testPathes.filter((testcasePath) => {
            const isSuitExist = !!this.suitesHashMapByPath[testcasePath.title];
            return !isSuitExist;
        });

        // Start creating of test suits
        await this.createSuites(this.options.projectCode, filterdTestPathes);
        await this.createTestCases(this.options.projectCode, this.preparedTestCases);

        // Start or reporting results
        await Promise.all(this.preparedTestCases.map(async (testcase) => {
            const id = this.casesHashMapByPath[`${testcase.path}/${testcase.title}`].id;
            if (id) {
                this.logTestItem(testcase);
                testcase.failureMessages = testcase.failureMessages.map((value) =>
                    value.replace(/\u001b\[.*?m/g, ''));
                const result = await this.api.results.createResult(
                    this.options.projectCode,
                    this.runId!,
                    new ResultCreate(
                        id,
                        Statuses[testcase.status],
                        {
                            // eslint-disable-next-line camelcase, @typescript-eslint/no-non-null-assertion
                            time_ms: testcase.duration!,
                            stacktrace: testcase.failureMessages.join('\n'),
                            comment: testcase.failureMessages.length > 0 ? testcase.failureMessages.map(
                                (value) => value.split('\n')[0]
                            ).join('\n') : undefined,
                        }
                    )
                );
                this.log(chalk`{green Test Case result was added ${JSON.stringify(result.data.result)}}`);
                this.publishedResultsCount++;
            }
        }));
    }

    private async createSuites(projectCode: string, testPathes: Array<{ title: string; parent: null | string }>) {
        try {
            for (const testPath of testPathes) {
                const { title, parent } = testPath;
                const isTestSuiteExist = this.suitesHashMapByPath[title];

                if (!isTestSuiteExist) {
                    const newSuitTitle = title.includes('/') ? testPath.title.split('/').pop() : title;
                    const newSuite: SuiteCreate = {
                        title: newSuitTitle || '',
                    };
                    if (parent && this.suitesHashMapByPath[parent] && this.suitesHashMapByPath[parent].id !== null) {
                        newSuite.parent_id = this.suitesHashMapByPath[parent].id;
                    }
                    const res = await this.api.suites.createSuite(projectCode, newSuite);
                    const createdSuite = {
                        id: Number(res.data.result?.id),
                        title: newSuite.title,
                        parentId: newSuite?.parent_id || null,
                    };
                    this.suitesHashMapBySuitId[createdSuite.id] = createdSuite;
                    this.suitesHashMapByPath[this.createSuitPath(createdSuite)] = createdSuite;
                }
            }
        } catch (error) {
            this.log(error);
        }
    }

    private async createTestCases(projectCode, cases: PreparedForReportingTestCase[]) {
        try {
            await Promise.all(
                cases.map(async (testcase) => {
                    const { path, title } = testcase;
                    const caseFullPath = `${path}/${title}`;

                    const isTestCaseExist = this.casesHashMapByPath[caseFullPath];
                    if (!isTestCaseExist) {
                        const resp = await this.api.cases.createCase(projectCode, {
                            title: testcase.title,
                            suite_id: this.suitesHashMapByPath[path].id,
                        });

                        const newTestCase = {
                            ...testcase,
                            suiteId: this.suitesHashMapByPath[path].id || null,
                            id: resp.data.result?.id,
                        };

                        const id = resp.data.result?.id;
                        this.casesHashMapByPath[caseFullPath] = newTestCase;
                        this.casesHashMapById[id!] = newTestCase;
                    }
                })
            );
            // for (const testcase of cases) {
            //     const { path, title } = testcase;
            //     const caseFullPath = `${path}/${title}`;

            //     const isTestCaseExist = this.casesHashMapByPath[caseFullPath];
            //     if (!isTestCaseExist) {
            //         const resp = await this.api.cases.createCase(projectCode, {
            //             title: testcase.title,
            //             suite_id: this.suitesHashMapByPath[path].id,
            //         });

            //         const newTestCase = {
            //             ...testcase,
            //             suiteId: this.suitesHashMapByPath[path].id || null,
            //             id: resp.data.result?.id,
            //         };

            //         const id = resp.data.result?.id;
            //         this.log('Test case created with id: ', id);
            //         this.casesHashMapByPath[caseFullPath] = newTestCase;
            //         this.casesHashMapById[id!] = newTestCase;
            //     }
            // }
        } catch (error) {
            this.log(`Error during publication of test results, ${JSON.stringify(error)}`);
        }
    }

    private async getCases(projectCode: string) {
        try {
            const limit = 25;
            const offset = 0;
            const resp = await this.api.cases.getCases(projectCode, limit, offset);

            const total = resp.data.result!.total!;
            const offsetsArray: number[] = [];
            for (let reqOffset = 0; reqOffset <= total; reqOffset += limit) {
                offsetsArray.push(reqOffset);
            }
            const respCasesArray = await Promise.all(offsetsArray.map((currentOffset) =>
                this.api.cases.getCases(projectCode, limit, currentOffset)));
            const allCasesEntities = respCasesArray.reduce((accum, value) => {
                const entities = value.data.result?.entities;

                if (entities) {
                    const simplefiedCasesArray = entities.map((caseItem) => {
                        const { title, id, suite_id, deleted } = caseItem;
                        return {
                            title,
                            id,
                            suiteId: suite_id,
                            deleted,
                        };
                    });
                    return [...accum, ...simplefiedCasesArray];
                } else {
                    return accum;
                }
            }, [] as SimplefiedTestCase[]);

            this.casesArray = allCasesEntities || [];
        } catch (error) {
            this.log(chalk`{red Error during getting cases from ${this.options.projectCode}}`);
        }
    }

    private async getSuites(projectCode: string) {
        try {
            const limit = 25;
            const offset = 0;
            const resp = await this.api.suites.getSuites(projectCode, limit, offset);

            const total = resp.data.result!.total!;
            const offsetsArray: number[] = [];
            for (let reqOffset = 0; reqOffset <= total; reqOffset += limit) {
                offsetsArray.push(reqOffset);
            }
            const respSuitsArray = await Promise.all(offsetsArray.map((currentOffset) =>
                this.api.suites.getSuites(projectCode, limit, currentOffset)));
            const allSuitesEntities = respSuitsArray.reduce((accum, value) => {
                const entities = value.data.result?.entities;

                if (entities) {
                    const simplefiedCasesArray = entities.map((suiteItem) => {
                        const { title, id, parent_id } = suiteItem;
                        return {
                            title,
                            id,
                            parentId: parent_id,
                        };
                    });
                    return [...accum, ...simplefiedCasesArray];
                } else {
                    return accum;
                }
            }, [] as SimplefiedTestSuit[]);

            // Creste suites array
            this.suitesArray = allSuitesEntities || [];
        } catch (error) {
            this.log(chalk`{red Error during getting suites from ${this.options.projectCode}}`);
        }
    }

    private async checkProject(projectCode: string, cb: (exists: boolean) => Promise<void>): Promise<void> {
        try {
            const resp = await this.api.projects.getProject(projectCode);

            await this.getSuites(projectCode);
            await this.getCases(projectCode);

            // Create hashmaps with suites and cases, already existed in Qase;
            this.createSuitesHashMaps();
            this.createCasesHashMaps();

            await cb(Boolean(resp.data.result?.code));
        } catch (err) {
            this.log(err);
            this.isDisabled = true;
        }
    }

    private createRunObject(name: string, cases: number[], args?: {
        description?: string;
        environment_id: number | undefined;
        is_autotest: boolean;
    }) {
        return {
            title: name,
            cases,
            ...args,
        };
    }

    private async createRun(
        name: string | undefined,
        description: string | undefined,
        cb: (created: IdResponse | undefined) => void
    ): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const environmentId = Number.parseInt(this.getEnv(Envs.environmentId)!, 10) || this.options.environmentId;

            const runObject = this.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || 'Jest automated run',
                    environment_id: environmentId,
                    is_autotest: true,
                }
            );
            const res = await this.api.runs.createRun(
                this.options.projectCode,
                runObject
            );

            cb(res.data);
        } catch (err) {
            this.log(`Error on creating run ${err as string}`);
            this.isDisabled = true;
        }
    }

    private async checkRun(runId: string | number | undefined, cb: (exists: boolean) => void): Promise<void> {
        if (runId === undefined) {
            cb(false);
            return;
        }

        return this.api.runs.getRun(this.options.projectCode, Number(runId))
            .then((resp) => {
                this.log(`Get run result on checking run ${resp.data.result?.id as unknown as string}`);
                cb(Boolean(resp.data.result?.id));
            })
            .catch((err) => {
                this.log(`Error on checking run ${err as string}`);
                this.isDisabled = true;
            });

    }

    private createSuitesHashMaps() {
        const suitesHashMapBySuitId = this.suitesArray.reduce((accum, value) => {
            const { id } = value;

            if (id) {
                accum[id] = value;
            }
            return accum;
        }, {} as { [key: number]: SimplefiedTestSuit });

        this.suitesHashMapBySuitId = suitesHashMapBySuitId;

        const suitesHashMapByPath = this.suitesArray
            .map((suite) => this.createSuitPath(suite)).reduce((accum, value, index) => {
                accum[value] = this.suitesArray[index];
                return accum;
            }, {} as SuitesHashMapByPath);

        this.suitesHashMapByPath = suitesHashMapByPath;
    }

    private createCasesHashMaps() {
        const casesHashMapById = this.casesArray.reduce((accum, value) => {
            const { id } = value;

            accum[id!] = value;
            return accum;
        }, {} as { [key: number]: SimplefiedTestCase });

        this.casesHashMapById = casesHashMapById;

        const casesHashMapByPath = this.casesArray.reduce((accum, value) => {
            const { suiteId, title } = value;

            if (title) {
                if (suiteId) {
                    const testSuiteItem = this.suitesHashMapBySuitId[suiteId];
                    const suitePath = this.createSuitPath(testSuiteItem);
                    const testCasePath = `${suitePath}/${title}`;
                    accum[testCasePath] = value;
                } else {
                    accum[title] = value;
                }
            }
            return accum;
        }, {} as { [key: number]: SimplefiedTestCase });

        this.casesHashMapByPath = casesHashMapByPath;
    }

    private createSuitPath = (item: SimplefiedTestSuit): string => {
        const { parentId } = item;

        if (parentId) {
            const parentItem = this.suitesHashMapBySuitId[parentId];
            const parentPath = this.createSuitPath(parentItem);
            const partialPath = `${parentPath}/${item.title!}`;

            return partialPath;
        }

        return item.title!;
    };
}

export = QaseReporter;
