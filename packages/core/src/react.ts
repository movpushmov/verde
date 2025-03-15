import { Scope, Subscription, Unit, UnitPayload } from './types';
import { is } from './utils';

type Units<Result extends any[]> = {
  [Key in keyof Result]: UnitPayload<Result[Key]>;
}[number];

interface ReactProps<T extends Unit[] | Unit> {
  clock: T;
  scope?: Scope;
  target: (
    scope: Scope,
    payload: T extends any[]
      ? Units<T>
      : T extends Unit
        ? UnitPayload<T>
        : never,
  ) => void;
}

function subsribe(
  unit: Unit,
  target: (scope: Scope, payload: any) => void,
): Subscription {
  if (is.writableStore(unit)) {
    return unit.changed.on(target);
  }

  if (is.mappedEvent(unit) || is.action(unit)) {
    return unit.on(target);
  }

  throw new Error();
}

export function react<T extends Unit[] | Unit>(
  props: ReactProps<T>,
): Subscription {
  const { clock, target, scope: forceScope } = props;

  const handler = (scope: Scope, payload: any) => {
    if (forceScope && scope !== forceScope) {
      return;
    }

    const callee = scope.batch(() => target(scope, payload));
    callee();
  };

  if (!Array.isArray(clock)) {
    return subsribe(clock, handler);
  }

  const subscriptions = clock.map((unit) => subsribe(unit, handler));

  return {
    cancel: () => {
      for (const subscription of subscriptions) {
        subscription.cancel();
      }
    },
  };
}
