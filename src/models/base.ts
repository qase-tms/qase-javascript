
export enum AccessLevel {
    ALL = 'all',
    GROUP = 'group',
    NONE = 'none',
}

export interface BaseList {
    total?: number;
    filtered?: number;
    count?: number;
}
