import type { Store, StoreWritable } from '@verde/core';
import type { ReactiveUnits, SupportedUnit } from './types';

import { is, react } from '@verde/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useScope } from './use-scope';

export function useUnit<T extends Record<string, SupportedUnit>>(
  shape: T,
): ReactiveUnits<T> {
  const scope = useScope();
  const stores = useRef<(Store<any> | StoreWritable<any>)[]>([]);
  const [updater, update] = useState(0);

  const result = useMemo(() => {
    const res: any = {};

    for (const key in shape) {
      const unit = shape[key];

      if (is.computedStore(unit) || is.writableStore(unit)) {
        stores.current.push(unit);
        res[key] = scope.get(unit);
      }

      if (is.action<any, any>(unit) || is.callableEvent(unit)) {
        res[key] = (payload: any) => unit(scope, payload);
      }

      throw `[useUnit] Unsupported unit ${key}`;
    }

    return res;
  }, [scope, updater]);

  useEffect(() => {
    const subscription = react({
      clock: stores.current,
      target: () => update((i) => i + 1),
    });

    return () => subscription.cancel();
  }, []);

  return result;
}
