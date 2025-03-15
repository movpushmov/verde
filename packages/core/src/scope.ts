import { Action, InteractableUnit, Scope, Store, StoreWritable } from './types';
import { api, is, symbols } from './utils';

interface ScopeConfig {
  values?: Map<Store<any>, any>;
  handlers?: Map<Action<any, any>, any>;
}

export function createScope(config: ScopeConfig = {}): Scope {
  let batchCalls = false;
  let batchQueue: [InteractableUnit, any][] = [];

  const values = new WeakMap<Store<any>, any>(config.values ?? []);

  const handlers = new WeakMap<Action<any, any, any>, any>(
    config.handlers ?? [],
  );

  const flatValues: Record<string, any> = {};

  function flush() {
    const flushMap: Map<InteractableUnit, any> = new Map();

    for (const [unit, payload] of batchQueue) {
      flushMap.set(unit, payload);
    }

    for (const [unit, payload] of flushMap) {
      scope.touch(unit, payload);
    }

    batchCalls = false;
    batchQueue = [];
  }

  const scope: Scope = {
    $$type: symbols.scope,

    async touch(unit, ...[payload]) {
      if (batchCalls) {
        batchQueue.push([unit, payload]);
        return;
      }

      if (is.writableStore(unit)) {
        values.set(unit, payload);

        if (unit.serialize && unit.sid) {
          flatValues[unit.sid] = payload;
        }

        return;
      }

      if (is.computedStore(unit)) {
        throw new Error('Cannot set value of computed store');
      }

      // @ts-expect-error -- ???
      await unit(scope, payload);
    },

    mockHandler<T, R, E>(
      action: Action<T, R, E>,
      handler: (params: T) => Promise<R>,
    ) {
      handlers.set(action, handler);
    },

    getHandler<T, R, E>(action: Action<T, R, E>): (params: T) => Promise<R> {
      return handlers.get(action);
    },

    get: <T>(store: Store<T> | StoreWritable<T>): T => {
      if (is.computedStore(store)) {
        if (!values.get(store)) {
          scope.compute(store);
        }

        return values.get(store) as T;
      }

      return (
        (values.get(store) as T) ?? (store as StoreWritable<T>).defaultValue
      );
    },

    compute: <T>(store: Store<T>) => {
      values.set(store, api.computed(store).mapper(scope));
    },

    batch<T extends (...args: any[]) => any>(cb: T): T {
      const fn = (...args: Parameters<T>): ReturnType<T> => {
        batchCalls = true;
        const res = cb(...args);
        flush();
        return res;
      };

      return fn as unknown as T;
    },

    serialize() {
      const result: Record<string, string> = {};

      for (const sid in flatValues) {
        result[sid] = JSON.stringify(flatValues[sid]);
      }

      return result;
    },
  };

  return scope;
}
