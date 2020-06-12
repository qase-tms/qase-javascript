/* eslint-disable camelcase */
import { Automation, BaseList, Behavior, Priority, Severity, Type } from './base';

export enum TestCaseStatus {
    ACTUAL = 'actual',
    DRAFT = 'draft',
    DEPRECATED = 'deprecated',
}

export class TestCaseFilters {
    public constructor(
        public filter: {
            search?: string;
            milestone_id?: number;
            suite_id?: number;
            severity?: Severity[];
            priority?: Priority[];
            type?: Type[];
            behavior?: Behavior[];
            automation?: Automation[];
            status?: TestCaseStatus[];
        }
    ) {}
}

export interface TestCaseInfo{
    id: any;
    position: any;
    title: any;
    description: any;
    preconditions: any;
    postconditions: any;
    severity: any;
    priority: any;
    type: any;
    behavior: any;
    automation: any;
    status: any;
    // eslint-disable-next-line camelcase
    milestone_id: any;
    // eslint-disable-next-line camelcase
    suite_id: any;
    tags: any[];
    links: any[];
    revision: any;
    // eslint-disable-next-line camelcase
    custom_fields: any[];
    attachments: any[];
    steps: any[];
    created: any;
    updated: any;
}

export interface TestCaseList extends BaseList {
    entities: TestCaseList[];
}
