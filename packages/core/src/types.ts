export interface Scope {
  $$type: symbol;

  touch: <T>(
    unit: InteractableUnit<T>,
    ...payload: IsOptional<T> extends void ? [] : [payload: T]
  ) => Promise<void>;

  getHandler: <T, R, E>(
    action: Action<T, R, E>,
  ) => ((params: T) => Promise<R>) | undefined;
  mockHandler: <T, R, E>(
    action: Action<T, R, E>,
    handler: (params: T) => Promise<R>,
  ) => void;

  get: <T>(store: Store<T> | StoreWritable<T>) => T;
  compute: <T>(store: Store<T>) => void;

  serialize(): Record<string, string>;

  batch: <T extends (...args: any[]) => any>(cb: T) => T;
}

export interface Store<Value> {
  $$type: symbol;
  changed: Event<Value>;

  map: <T>(map: (scope: Scope, payload: Value) => T) => Store<T>;
}

export interface StoreWritable<Value> extends Store<Value> {
  (scope: Scope, payload: Value): void;
  (scope: Scope, payload: Value, shadowScope?: Scope): void;

  reset: EventCallable<void>;

  defaultValue: Value;
  sid?: string | undefined;
  writable: true;
  serialize: boolean;
}

export type EventHandler<Payload> = {
  (scope: Scope, payload: Payload): void;
  isolated?: boolean;
};

export interface Event<Payload> {
  $$type: symbol;
  map: <T>(map: (scope: Scope, payload: Payload) => T) => Event<T>;

  filter: (
    filter: (scope: Scope, payload: Payload) => boolean,
  ) => Event<Payload>;

  on: (handler: EventHandler<Payload>) => Subscription;
  hasSubscribers: boolean;
}

export interface EventCallable<Payload> extends Event<Payload> {
  (scope: Scope, payload: Payload): void;
  (scope: Scope, payload: Payload, shadowScope?: Scope): void;
  callable: true;
}

export interface Action<Params, Done, Fail = Error> extends Event<Params> {
  $$type: symbol;

  (scope: Scope, params: Params): Promise<Done>;
  (scope: Scope, params: Params, shadowScope?: Scope): Promise<Done>;

  done: Event<{ params: Params; result: Done }>;
  fail: Event<{ params: Params; result: Fail }>;

  mock: EventCallable<(params: Params) => Promise<Done>>;

  doneData: Event<Done>;
  failData: Event<Fail>;
}

export interface Gate<T> {
  $state: Store<T>;
  $isOpened: Store<boolean>;

  open: EventCallable<T>;
  close: EventCallable<void>;

  opened: Event<T>;
  closed: Event<void>;
}

export type ModelShape = { [k: string]: InteractableUnit | ModelShape };

export type ModelState<State extends ModelShape> = State & {
  $$destroy: () => void;
};

export type Model<Params, State extends ModelShape> = (
  params: Params,
) => ModelState<State>;

export type ModelFactory<Params, State extends ModelShape> = (
  params: Params,
  ctx: ModelContext,
) => State;

export type ModelContext = { onDestroy: (handler: () => void) => void };

export type InteractableUnit<T = any> =
  | StoreWritable<T>
  | EventCallable<T>
  | Action<T, any, any>;

export type Unit<T = any> = Store<T> | Event<T> | InteractableUnit<T>;

export type WatcherPayload =
  | { type: 'unit'; unit: Unit }
  | { type: 'subscription'; subscription: Subscription };

export type Watcher = (payload: WatcherPayload) => void;
export type ComputedTarget = Store<any>[] | Store<any>;
export type UnitPayload<T extends Unit> = T extends Unit<infer K> ? K : never;

type StoreValues<T> = { [Key in keyof T]: Store<T[Key]> };

export type ComputedMap<T extends ComputedTarget, R> =
  T extends Store<infer K>
    ? (scope: Scope, payload: K) => R
    : T extends Store<any>[]
      ? (scope: Scope, payload: StoreValues<T>) => R
      : never;

export interface ComputedApi<R> {
  mapper: (scope: Scope) => R;
}

export interface Subscription {
  cancel: () => void;
}

type IsOptional<T> = [T] extends [void]
  ? true
  : [T] extends [null]
    ? true
    : false;
