import { Action, Event, Region, Scope, Store, Unit, Watcher } from "./types";

export const symbols = {
  store: Symbol("store"),
  event: Symbol("event"),
  action: Symbol("action"),
  scope: Symbol("scope"),
  region: Symbol("region"),
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

export const is = {
  store<Value = unknown>(object: unknown): object is Store<Value> {
    return (
      object !== null &&
      typeof object === "object" &&
      "$$type" in object &&
      object.$$type === symbols.store
    );
  },

  event<Payload = unknown>(object: unknown): object is Event<Payload> {
    return (
      object !== null &&
      typeof object === "object" &&
      "$$type" in object &&
      object.$$type === symbols.event
    );
  },

  action<Params = unknown, Done = unknown, Fail = Error>(
    object: unknown,
  ): object is Action<Params, Done, Fail> {
    return (
      object !== null &&
      typeof object === "object" &&
      "$$type" in object &&
      object.$$type === symbols.action
    );
  },

  region(object: unknown): object is Region {
    return (
      object !== null &&
      typeof object === "object" &&
      "$$type" in object &&
      object.$$type === symbols.region
    );
  },

  scope(object: unknown): object is Scope {
    return (
      object !== null &&
      typeof object === "object" &&
      "$$type" in object &&
      object.$$type === symbols.scope
    );
  },
};
