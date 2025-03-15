import {
  Action,
  ComputedApi,
  Event,
  EventCallable,
  Scope,
  Store,
  StoreWritable,
  Unit,
  Watcher,
} from './types';

export const symbols = {
  store: Symbol('store'),
  event: Symbol('event'),
  action: Symbol('action'),
  scope: Symbol('scope'),
};

const watchersStack: Watcher[] = [];
let watcher: Watcher | undefined;

export function createWatcher(on: Watcher) {
  if (watcher) {
    watchersStack.push(watcher);
  }

  watcher = on;

  return {
    cancel() {
      watcher = watchersStack.pop();
    },
  };
}

export function registerUnits(...units: Unit[]) {
  for (const unit of units) {
    watcher?.(unit);
  }
}

export const api = {
  computed<R>(store: Store<R>) {
    return store as unknown as ComputedApi<R>;
  },
};

export const is = {
  writableStore<Value = unknown>(
    object: unknown,
  ): object is StoreWritable<Value> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.store &&
      'writable' in object &&
      object.writable == true
    );
  },

  computedStore<Value = unknown>(object: unknown): object is Store<Value> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.store &&
      !('writable' in object)
    );
  },

  mappedEvent<Payload = unknown>(object: unknown): object is Event<Payload> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.event &&
      !('callable' in object)
    );
  },

  callableEvent<Payload = unknown>(
    object: unknown,
  ): object is EventCallable<Payload> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.event &&
      'callable' in object &&
      object.callable == true
    );
  },

  action<Params = unknown, Done = unknown, Fail = Error>(
    object: unknown,
  ): object is Action<Params, Done, Fail> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.action
    );
  },

  scope(object: unknown): object is Scope {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.scope
    );
  },
};
