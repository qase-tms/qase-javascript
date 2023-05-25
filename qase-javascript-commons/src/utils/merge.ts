import deepmerge from 'deepmerge';

export type MergeType<T extends unknown[], A = NonNullable<unknown>> = T extends [infer F, ...(infer R)] ? MergeType<R, F & A> : A;

declare module 'deepmerge' {
    function all<T extends unknown[]>(objects: T, options?: deepmerge.Options): MergeType<T>;
}

export const merge = <T extends unknown[]>(...args: T) => deepmerge.all(args);
