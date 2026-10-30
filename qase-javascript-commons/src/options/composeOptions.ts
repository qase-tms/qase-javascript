import mergeWith from 'lodash.mergewith';

type MergedType<T extends unknown[], A = NonNullable<unknown>> =
  T extends [infer F, ...(infer R)] ? MergedType<R, F & A> : A;

// Arrays are replaced whole: lodash merges them by index, so env tags [a] over config [b, c] gave [a, c].
const customizer = (value: unknown, src: unknown) => {
  if (src === undefined) return value;
  if (Array.isArray(src)) return src as unknown[];
  return undefined;
};

export const composeOptions = <T extends unknown[]>(...args: T): MergedType<[NonNullable<unknown>, ...T]> => {
  return mergeWith({}, ...args, customizer) as MergedType<[NonNullable<unknown>, ...T]>;
}
