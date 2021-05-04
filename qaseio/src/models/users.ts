import { BaseList } from './base';

export interface UserInfo {
    id: any;
    name: any;
    email: any;
    title: any;
    status: number;
}

export interface UserList extends BaseList {
    entities: UserInfo[];
}
