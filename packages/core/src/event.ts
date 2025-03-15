import type {
  EventCallable,
  EventHandler,
  Scope,
  Subscription,
  Unit,
} from './types';
import { registerUnits, symbols } from './utils';

export function createEvent<T = void>(): EventCallable<T> {
  const derivedUnits: Unit[] = [];
  const handlers: EventHandler<T>[] = [];

  function getSignature(forceScope?: Scope) {
    return (scope: Scope, payload: T) => {
      for (const handler of handlers) {
        handler(forceScope ?? scope, payload);
      }
    };
  }

  const baseBody = {
    $$type: symbols.event,

    map: <K>(mapper: (scope: Scope, payload: T) => K) => {
      const mapped = createEvent<K>();

      event.on(function (scope: Scope, payload: T) {
        scope.touch(mapped, mapper(scope, payload));
      });

      derivedUnits.push(mapped);

      return mapped;
    },

    filter: (condition: (scope: Scope, payload: T) => boolean) => {
      const filtered = createEvent<T>();
      event.on(function (scope, payload) {
        if (condition(scope, payload)) {
          scope.touch(filtered, payload);
        }
      });

      derivedUnits.push(filtered);

      return filtered;
    },

    on: (handler: EventHandler<T>): Subscription => {
      handlers.push(handler);

      return {
        cancel: () => {
          handlers.splice(
            handlers.findIndex((h) => h === handler),
            1,
          );
        },
      };
    },

    callable: true,

    scopeBind: (forceScope: Scope) =>
      Object.assign(getSignature(forceScope), baseBody),

    get hasSubscribers() {
      return handlers.length > 0;
    },
  } as const;

  const event: EventCallable<T> = Object.assign(getSignature(), baseBody);

  registerUnits(event);

  return Object.assign(event, { $$type: symbols.event, derivedUnits });
}
