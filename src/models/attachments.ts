import { BaseList } from './base';

/* eslint-disable camelcase */
export interface AttachmentCreated{
    hash: any;
    filename: any;
    mime: any;
    extension: any;
    url: any;
}

export interface AttachmentInfo{
    hash: any;
    file: any;
    mime: any;
    size: number;
    full_path: any;
}

export interface AttachmentList extends BaseList {
    entities: AttachmentInfo[];
}
