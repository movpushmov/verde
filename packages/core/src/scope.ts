import { EventCallable, Scope, Store } from "./types";
import { is, symbols } from "./utils";

export function createScope(): Scope {
  const scope = {
    $$type: symbols.scope,

    values: new WeakMap(),

    touch(unit, payload) {
      if (is.store(unit)) {
        if (scope.get(unit) !== payload) {
          scope.values.set(unit, payload);
          (unit.changed as EventCallable<any>).call({ scope }, payload);
        }
      } else {
        unit.call({ scope }, payload);
      }
    },

    get: <T>(store: Store<T>) =>
      (scope.values.get(store) as T) ?? store.defaultValue,
  } as Scope;

  return scope;
}
