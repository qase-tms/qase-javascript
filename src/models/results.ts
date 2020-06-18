/* eslint-disable camelcase */
import { BaseList } from './base';

export enum ResultStatus {
    IN_PROGRESS = 'in_progress',
    PASSED = 'passed',
    FAILED = 'failed',
    SKIPPED = 'skipped',
    BLOCKED = 'blocked',
}

export class ResultFilters {
    public constructor(
        public filter: {
            status?: ResultStatus[];
            member?: number;
            run?: number;
            case_id?: number;
            from_end_time?: string;
            to_end_time?: string;
        }
    ) {}
}

export class ResultStepCreate {
    public constructor(
        public position: number,
        public status: ResultStatus,
        public attachments: string[] = [],
        public comment?: string,
    ) {}
}

export class ResultCreate {
    public time?: number;
    public member_id?: number;
    public comment?: string;
    public stacktrace?: string;
    public defect?: boolean;
    public steps?: ResultStepCreate[];
    public attachments?: string[];
    public constructor(
        public case_id: number,
        public status: ResultStatus,
        args?: {
            time?: number;
            member_id?: number;
            comment?: string;
            stacktrace?: string;
            defect?: boolean;
            steps?: ResultStepCreate[];
            attachments?: string[];
        },
    ) {
        Object.assign(this, args);
    }
}

export class ResultUpdate {
    public status?: ResultStatus;
    public time?: number;
    public comment?: string;
    public stacktrace?: string;
    public defect?: boolean;
    public steps?: ResultStepCreate[];
    public attachments?: string[];
    public constructor(
        args?: {
            status?: ResultStatus;
            time?: number;
            comment?: string;
            stacktrace?: string;
            defect?: boolean;
            steps?: ResultStepCreate[];
            attachments?: string[];
        },
    ) {
        Object.assign(this, args);
    }
}

export interface ResultCreated {
    hash: string;
}

export interface ResultInfo{
    hash: any;
    comment: any;
    stacktrace: any;
    run_id: any;
    case_id: any;
    steps: any[];
    status: any;
    is_api_result: any;
    time_spent: any;
    end_time: any;
    attachments: any[];
}

export interface ResultList extends BaseList {
    entities: ResultInfo[];
}
