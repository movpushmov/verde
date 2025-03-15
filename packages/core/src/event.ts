import { EventCallable, EventHandler, TouchContext, Unit } from "./types";
import { registerUnits, symbols } from "./utils";

export function createEvent<T>(): EventCallable<T> {
  const derivedUnits: Unit[] = [];
  let handlers: EventHandler<T>[] = [];

  const event: EventCallable<T> = Object.assign(
    function (this: TouchContext, payload: T) {
      for (const handler of handlers) {
        handler.call(this, payload);
      }
    },
    {
      $$type: symbols.event,

      map: <K>(mapper: (payload: T) => K) => {
        const mapped = createEvent<K>();
        event.on(function (this: TouchContext, payload) {
          this.scope.touch(mapped, mapper(payload));
        });

        derivedUnits.push(mapped);

        return mapped;
      },
      filter: (condition: (payload: T) => boolean) => {
        const filtered = createEvent<T>();
        event.on(function (this: TouchContext, payload) {
          if (condition(payload)) {
            this.scope.touch(filtered, payload);
          }
        });

        derivedUnits.push(filtered);

        return filtered;
      },
      on: (handler: EventHandler<T>) => handlers.push(handler),
    },
  );

  registerUnits(event);

  return Object.assign(event, {
    $$type: symbols.event,
    derivedUnits,
    clearHandlers() {
      handlers = [];
    },
  });
}
