/* eslint-disable camelcase */
import { BaseList } from './base';

export enum DefectStatus {
    OPEN = 'open',
    RESOLVED = 'resolved',
}

export class DefectFilters {
    public constructor(
        public filter: {
            status?: DefectStatus;
        }
    ) {}
}

export interface DefectUpdated {
    id: number;
}

export interface DefectInfo{
    id: any;
    title: any;
    actual_result: any;
    status: any;
    user_id: number;
    attachments: any;
    created: any;
    updated: any;
}

export interface DefectList extends BaseList {
    entities: DefectInfo[];
}
