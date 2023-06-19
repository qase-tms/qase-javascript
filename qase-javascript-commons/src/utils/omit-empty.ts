export type OmitEmptyType<T> = {
  [K in keyof T]?: NonNullable<T[K]>;
};

/**
 * @template {Record<string, unknown>>} T
 * @param {Partial<T> | T} obj
 * @returns {asserts obj is OmitEmptyType<T>}
 */
export function omitEmpty<T extends Record<string, unknown>>(
  obj: T | Partial<T>,
): asserts obj is OmitEmptyType<T> {
  Object.keys(obj).forEach((key) => {
    if ((obj[key] === undefined || obj[key] === null) && !delete obj[key]) {
      throw new Error(`Cannot delete property \`${key}\``);
    }
  });
}
