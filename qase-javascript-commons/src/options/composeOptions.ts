import mergeWith from 'lodash.mergewith';

type MergedType<T extends unknown[], A = NonNullable<unknown>> =
  T extends [infer F, ...(infer R)] ? MergedType<R, F & A> : A;

const skipUndef = (value: unknown, src: unknown) => (src === undefined ? value : undefined);

export const composeOptions = <T extends unknown[]>(...args: T): MergedType<[NonNullable<unknown>, ...T]> => {
  return mergeWith({}, ...args, skipUndef) as MergedType<[NonNullable<unknown>, ...T]>;
}
