/* eslint-disable camelcase */
import { BaseList } from './base';

export class PlanCreate {
    public description?: string;
    public constructor(
        public title: string,
        public cases: number[] = [],
        args?: {
            description?: string;
        },
    ) {
        if (this.cases.length < 1) {
            throw new Error('You should pass cases');
        }
        Object.assign(this, args);
    }
}

export class PlanUpdate {
    public title?: string;
    public cases: number[] = [];
    public description?: string;
    public constructor(
        args?: {
            title?: string;
            cases?: number[];
            description?: string;
        },
    ) {
        Object.assign(this, args);
    }
}

export interface PlanCreated {
    id: number;
}

export interface PlanSteps{
    case_id: any;
    assignee_id: any;
}

export interface PlanInfo{
    id: any;
    title: any;
    description: any;
    cases_count: any;
    created: any;
    updated: any;
    average_time: any;
    cases: PlanSteps[];
}

export interface PlanList extends BaseList {
    entities: PlanInfo[];
}
