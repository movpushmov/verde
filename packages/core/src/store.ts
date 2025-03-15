import { createEvent } from './event';
import { watch } from './watch';
import {
  ComputedApi,
  ComputedMap,
  ComputedTarget,
  Scope,
  Store,
  StoreWritable,
} from './types';
import { ctx, symbols } from './utils';

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

  const store: StoreWritable<T> = Object.assign(
    (scope: Scope, payload: T) => {
      const old = scope.get(store);
      scope.touch(store, payload);

      if (old !== payload) {
        changed(scope, payload);
      }
    },
    {
      $$type: symbols.store,
      defaultValue,
      changed,
      reset,
      writable: true,
      serialize: Boolean(serialize),
      sid,
      map: ((mapper) => computed(store, mapper)) as StoreWritable<T>['map'],
    } as const,
  );

  watch({ on: reset, do: (scope) => scope.touch(store, defaultValue) });

  ctx.registerUnits(store, changed);

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

  ctx.registerUnits(store, changed);

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
