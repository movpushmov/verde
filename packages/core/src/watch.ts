import { Scope, Subscription, Unit, UnitPayload } from './types';
import { is } from './utils';

type Units<Result extends any[]> = {
  [Key in keyof Result]: UnitPayload<Result[Key]>;
}[number];

interface ReactProps<T extends Unit[] | Unit> {
  on: T;
  do: (
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

export function watch<T extends Unit[] | Unit>(
  props: ReactProps<T>,
): Subscription {
  const { on, do: target } = props;

  const handler = (scope: Scope, payload: any) => {
    scope.batch(() => target(scope, payload))();
  };

  if (!Array.isArray(on)) {
    return subsribe(on, handler);
  }

  const subscriptions = on.map((unit) => subsribe(unit, handler));

  return {
    cancel: () => {
      for (const subscription of subscriptions) {
        subscription.cancel();
      }
    },
  };
}
