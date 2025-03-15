import { createEvent } from "./event";
import { Store } from "./types";
import { registerUnits, symbols } from "./utils";

export function createStore<T>(defaultValue: T): Store<T> {
  const changed = createEvent<T>();

  const store = {
    $$type: symbols.store,
    defaultValue,
    changed,
  } as Store<T>;

  registerUnits(store, changed);

  return store;
}
