export function createFactory<T, R>(
  constructor: (params: T) => R,
): (params: T) => R {
  return constructor;
}
