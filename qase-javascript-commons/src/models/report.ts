import { HostData } from './host-data';
import { ShortResult } from './short-result';
import { Stats } from './stats';
import { ExecutionSum } from './execution-sum';

export type Report = {
    environment: string
    execution: ExecutionSum
    host_data: HostData
    results: ShortResult[]
    stats: Stats
    suites: any[]
    threads: string[]
    title: string
}

