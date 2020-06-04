import { BaseList } from './base';

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
