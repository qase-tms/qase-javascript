import mergeWith from 'lodash.mergewith';

type MergedType<T extends unknown[], A = NonNullable<unknown>> =
  T extends [infer F, ...(infer R)] ? MergedType<R, F & A> : A;

declare module 'lodash' {
  interface LoDashStatic {
    mergeWith<T extends unknown[]>(...args: [...T, MergeWithCustomizer]): MergedType<T>;
  }
}

const skipUndef = (value: unknown, src: unknown) => (src === undefined ? value : undefined);

export const composeOptions = <T extends unknown[]>(...args: T): MergedType<[NonNullable<unknown>, ...T]> => {
  return mergeWith({}, ...args, skipUndef);
}
