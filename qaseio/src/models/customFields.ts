/* eslint-disable camelcase */
import { BaseList } from './base';

export interface CustomFieldInfo{
    id: any;
    title: any;
    type: any;
    placeholder: any;
    default_value: any;
    value: any;
    is_required: boolean;
    is_visible: boolean;
    is_filterable: boolean;
    created: any;
    updated: any;
}

export interface CustomFieldList extends BaseList {
    entities: CustomFieldInfo[];
}
