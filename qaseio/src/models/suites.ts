/* eslint-disable camelcase */
import { BaseList } from './base';

export class SuiteFilters {
    public constructor(
        public filter: {
            search?: string;
        }
    ) {}
}

export class SuiteCreate {
    public description?: string;
    public preconditions?: string;
    public parent_id?: number;
    public constructor(
        public title: string,
        args?: {
            description?: string;
            preconditions?: string;
            parent_id?: number;
        },
    ) {
        Object.assign(this, args);
    }
}

export class SuiteUpdate {
    public title?: string;
    public description?: string;
    public preconditions?: string;
    public parent_id?: number;
    public constructor(
        args?: {
            title?: string;
            description?: string;
            preconditions?: string;
            parent_id?: number;
        },
    ) {
        Object.assign(this, args);
    }
}

export interface SuiteCreated {
    id: number;
}

export interface SuiteInfo{
    id: any;
    title: any;
    description: any;
    preconditions: any;
    position: number;
    cases_count: number;
    parent_id: number;
    created: any;
    updated: any;
}

export interface SuiteList extends BaseList {
    entities: SuiteInfo[];
}
