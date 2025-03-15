import { createEvent } from './event';
import { react } from './react';
import {
  ComputedApi,
  ComputedMap,
  ComputedTarget,
  Scope,
  Store,
  StoreWritable,
} from './types';
import { registerUnits, symbols } from './utils';

interface CreateStoreProps {
  sid?: string;
  serialize?: boolean;
}

export function createStore<T>(
  defaultValue: T,
  props: CreateStoreProps = {},
): StoreWritable<T> {
  const { serialize = true, sid } = props;

  const changed = createEvent<T>();
  const reset = createEvent();

  function getSignature(forceScope?: Scope) {
    return (scope: Scope, payload: T) => {
      const currentScope = forceScope ?? scope;

      const old = currentScope.get(store);
      currentScope.touch(store, payload);

      if (old !== payload) {
        changed(currentScope, payload);
      }
    };
  }

  const baseBody = {
    $$type: symbols.store,
    defaultValue,
    changed,
    reset,
    writable: true,
    serialize: Boolean(serialize),
    sid,
    map: ((mapper) => computed(store, mapper)) as StoreWritable<T>['map'],

    scopeBind: (forceScope: Scope) =>
      Object.assign(getSignature(forceScope), baseBody),
  } as const;

  const store: StoreWritable<T> = Object.assign(getSignature(), baseBody);

  react({ clock: reset, target: (scope) => scope.touch(store, defaultValue) });

  registerUnits(store, changed);

  return store;
}

export function computed<T extends ComputedTarget, R>(
  sources: T,
  map: ComputedMap<T, R>,
): Store<R> {
  const changed = createEvent<R>();
  const store: Store<R> = {
    $$type: symbols.store,

    changed,
    map: <T>(mapper: ComputedMap<Store<R>, T>) => computed(store, mapper),
  };

  const handler = (scope: Scope) => {
    if (!changed.hasSubscribers) {
      return;
    }

    scope.compute(store);
  };

  if (Array.isArray(sources)) {
    for (const source of sources as Store<any>[]) {
      source.changed.on(handler);
    }
  } else {
    sources.changed.on(handler);
  }

  registerUnits(store, changed);

  return Object.assign(store, {
    mapper: (scope) =>
      map(
        scope,
        Array.isArray(sources)
          ? sources.map((source) => scope.get(source))
          : scope.get(sources),
      ),
  } satisfies ComputedApi<R>);
}
