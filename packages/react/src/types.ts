import type {
  Action,
  EventCallable,
  ModelShape,
  Store,
  StoreWritable,
  UnitPayload,
} from '@verde/core';

export type SupportedUnit =
  | Store<any>
  | StoreWritable<any>
  | EventCallable<any>
  | Action<any, any, any>;

export type ReactiveUnit<Unit> = Unit extends Store<any> | StoreWritable<any>
  ? UnitPayload<Unit>
  : Unit extends Action<infer Payload, infer Result>
    ? (payload: Payload) => Promise<Result>
    : Unit extends EventCallable<infer Payload>
      ? (payload: Payload) => void
      : never;

export type ReactiveUnits<
  Shape extends Record<string, SupportedUnit> | SupportedUnit,
> = Shape extends SupportedUnit
  ? ReactiveUnit<Shape>
  : Shape extends Record<string, SupportedUnit>
    ? { [k in keyof Shape]: ReactiveUnit<Shape[k]> }
    : never;

export type ReactiveModel<Shape extends ModelShape> = {
  [k in keyof Shape]: Shape[k] extends SupportedUnit
    ? ReactiveUnit<Shape[k]>
    : Shape[k] extends ModelShape
      ? ReactiveModel<Shape[k]>
      : never;
};
