export interface Scope {
  values: WeakMap<Store<unknown>, unknown>;

  touch: <T>(
    unit: Store<T> | EventCallable<T> | Action<T, unknown>,
    payload: T,
  ) => void;

  get: <T>(store: Store<T>) => T;
}

export interface Region {
  destroy: () => void;
}

export interface Store<Value> {
  defaultValue: Value;
  changed: Event<Value>;
  sid?: string;
}

export type EventHandler<Payload> = (payload: Payload) => void;

export interface Event<Payload> {
  map: <T>(map: (payload: Payload) => T) => Event<T>;
  filter: (filter: (payload: Payload) => boolean) => Event<Payload>;
  on: (handler: EventHandler<Payload>) => void;
}

export interface EventCallable<Payload> extends Event<Payload> {
  (payload: Payload): void;
}

export interface Action<Params, Done, Fail = Error> {
  (params: Params): Promise<Done>;

  done: Event<{ params: Params; result: Done }>;
  fail: Event<{ params: Params; result: Fail }>;

  doneData: Event<Done>;
  failData: Event<Fail>;
}

export interface TouchContext {
  scope: Scope;
}

type BaseUnit =
  | Store<any>
  | Action<any, any, any>
  | Event<any>
  | EventCallable<any>;

type MemoryProperties = {
  derivedUnits: ExtendedUnit[];
  clearHandlers: () => void;
};

export type Unit = BaseUnit | Region;
export type ExtendedUnit = BaseUnit & MemoryProperties;

export type Watcher = (unit: Unit) => void;
