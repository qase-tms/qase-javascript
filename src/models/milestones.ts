/* eslint-disable camelcase */
import { BaseList } from './base';

export class MilestoneFilters {
    public constructor(
        public filter: {
            search?: string;
        }
    ) {}
}

export class MilestoneCreate {
    public description?: string;
    public constructor(
        public title: string,
        args?: {
            description?: string;
        },
    ) {
        Object.assign(this, args);
    }
}

export class MilestoneUpdate {
    public title?: string;
    public description?: string;
    public constructor(
        args?: {
            title?: string;
            description?: string;
        },
    ) {
        Object.assign(this, args);
    }
}

export interface MilestoneCreated {
    id: number;
}

export interface MilestoneInfo{
    id: any;
    title: any;
    description: any;
    due_date: any;
    created: any;
    updated: any;
}

export interface MilestoneList extends BaseList {
    entities: MilestoneInfo[];
}
