/* eslint-disable camelcase */
import { BaseList } from './base';

export enum RunStatus {
    ACTIVE = 'active',
    COMPLETE = 'complete',
    ABORT = 'abort',
}

export class RunFilters {
    public constructor(
        public filter: {
            status?: RunStatus[];
        }
    ) {}
}

export class RunCreate {
    public description?: string;
    public environment_id?: number;
    public constructor(
        public title: string,
        public cases: number[] = [],
        args?: {
            description?: string;
            environment_id?: number;
        },
    ) {
        if (this.cases.length < 1) {
            throw new Error('You should pass cases');
        }
        Object.assign(this, args);
    }
}

export interface RunCreated {
    id: number;
}

export interface RunInfoStats{
    total: any;
    untested: any;
    passed: any;
    failed: any;
    blocked: any;
    skipped: any;
    retest: any;
    deleted: any;
}

export interface RunInfo{
    id: any;
    title: any;
    description: any;
    status: any;
    start_time: any;
    end_time: any;
    public: any;
    stats: RunInfoStats;
    time_spent: any;
    user_id: any;
    environment: any;
    cases: any[];
}

export interface RunList extends BaseList {
    entities: RunInfo[];
}
