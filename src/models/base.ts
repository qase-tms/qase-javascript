
export enum AccessLevel {
    ALL = 'all',
    GROUP = 'group',
    NONE = 'none',
}

export enum Severity {
    UNDEFINED = 'undefined',
    BLOCKER = 'blocker',
    CRITICAL = 'critical',
    MAJOR = 'major',
    NORMAL = 'normal',
    MINOR = 'minor',
    TRIVIAL = 'trivial',
}

export enum Priority {
    UNDEFINED = 'undefined',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export enum Type {
    OTHER = 'other',
    FUNCTIONAL = 'functional',
    SMOKE = 'smoke',
    REGRESSION = 'regression',
    SECURITY = 'security',
    USABILITY = 'usability',
    PERFORMANCE = 'performance',
    ACCEPTANCE = 'acceptance',
}

export enum Behavior {
    UNDEFINED = 'undefined',
    POSITIVE = 'positive',
    NEGATIVE = 'negative',
    DESTRUCTIVE = 'destructive',
}

export enum Automation {
    IS_NOT_AUTOMATED = 'is-not-automated',
    AUTOMATED = 'automated',
    TO_BE_AUTOMATED = 'to-be-automated',
}

export interface BaseGetAllParams {
    limit?: number; offset?: number;
}

export interface BaseList {
    total?: number;
    filtered?: number;
    count?: number;
}

export class Filter {
    public constructor(
        private filters?: Record<string, any>
    ) {}

    public filter(): Record<string, string> {
        if (this.filters === undefined) {
            return {};
        }
        const res = Object.entries(this.filters).reduce((result, item) => {
            const key = item[0];
            let value: string;
            if (item[1] instanceof Array) {
                value = item[1].join(',');
            } else {
                value = item[1] as string;
            }
            result[`filter[${key}]`] = value;
            return result;
        }, {});
        return res;
    }
}
