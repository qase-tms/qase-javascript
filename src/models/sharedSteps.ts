/* eslint-disable camelcase */
import { BaseList } from './base';

export class SharedStepFilters {
    public constructor(
        public filter: {
            search?: string;
        }
    ) {}
}

export class SharedStepCreate {
    public expected_result?: string;
    public constructor(
        public title: string,
        public action: string,
        args?: {
            expected_result?: string;
        },
    ) {
        Object.assign(this, args);
    }
}

export class SharedStepUpdate {
    public title?: string;
    public action?: string;
    public expected_result?: string;
    public constructor(
        args?: {
            title?: string;
            action?: string;
            expected_result?: string;
        },
    ) {
        Object.assign(this, args);
    }
}

export interface SharedStepCreated {
    hash: string;
}

export interface SharedStepInfo{
    hash: any;
    title: any;
    action: any;
    expected_result: any;
    cases: number[];
    cases_count: number;
    created: any;
    updated: any;
}

export interface SharedStepList extends BaseList {
    entities: SharedStepInfo[];
}
