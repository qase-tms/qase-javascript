import { AccessLevel, BaseList } from '.';

export class ProjectCreate {
    public constructor(
        public title: string,
        public code: string,
        public description?: string,
        public access: AccessLevel = AccessLevel.NONE,
        public group?: string,
    ) {}
}

export interface ProjectCreated {
    code: string;
}

export interface ProjectCountsRuns {
    total?: any;
    active?: any;
}

export interface ProjectCountsDefects {
    total?: any;
    open?: any;
}

export interface ProjectCounts {
    cases?: any;
    suites?: any;
    milestones?: any;
    runs: ProjectCountsRuns;
    defects: ProjectCountsDefects;
}

export interface ProjectInfo {
    title?: string;
    code?: string;
    counts: ProjectCounts;
}

export interface ProjectList extends BaseList {
    entities: ProjectInfo[];
}
