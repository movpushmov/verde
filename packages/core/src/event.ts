import type {
  EventCallable,
  EventHandler,
  Scope,
  Subscription,
  Unit,
} from './types';
import { ctx, symbols } from './utils';

export function createEvent<T = void>(): EventCallable<T> {
  const derivedUnits: Unit[] = [];
  const handlers: EventHandler<T>[] = [];

  const event: EventCallable<T> = Object.assign(
    (scope: Scope, payload: T) => {
      for (const handler of handlers) {
        handler(scope, payload);
      }
    },
    {
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
        const sIndex = handlers.length - 1;

        const subscription = {
          cancel: () => {
            handlers.splice(sIndex, 1);
          },
        };

        ctx.registerSubscription(subscription);

        return subscription;
      },

      callable: true,

      get hasSubscribers() {
        return handlers.length > 0;
      },
    } as const,
  );

  ctx.registerUnits(event);

  return Object.assign(event, { $$type: symbols.event, derivedUnits });
}
