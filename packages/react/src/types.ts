import type {
  Action,
  EventCallable,
  Store,
  StoreWritable,
  UnitPayload,
} from '@verde/core';

export type SupportedUnit =
  | Store<any>
  | StoreWritable<any>
  | EventCallable<any>
  | Action<any, any, any>;

export type ReactiveUnits<T extends Record<string, SupportedUnit>> = {
  [k in keyof T]: T[k] extends Store<any> | StoreWritable<any>
    ? UnitPayload<T[k]>
    : T[k] extends Action<infer Payload, infer Result>
      ? (payload: Payload) => Promise<Result>
      : T[k] extends EventCallable<infer Payload>
        ? (payload: Payload) => void
        : never;
};
