import type { Store, StoreWritable } from '@verde/core';
import type { ReactiveUnits, SupportedUnit } from './types';

import { is, watch } from '@verde/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useScope } from './use-scope';

export function useUnit<
  T extends Record<string, SupportedUnit> | SupportedUnit,
>(shape: T): ReactiveUnits<T> {
  const scope = useScope();
  const stores = useRef<(Store<any> | StoreWritable<any>)[]>([]);
  const [updater, update] = useState(0);

  const result = useMemo(() => {
    if (is.computedStore(shape) || is.writableStore(shape)) {
      stores.current.push(shape);
      return scope.get(shape);
    }

    if (is.action<any, any>(shape) || is.callableEvent(shape)) {
      return (payload: any) => shape(scope, payload);
    }

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
    const subscription = watch({
      on: stores.current,
      do: () => update((i) => i + 1),
    });

    return () => subscription.cancel();
  }, []);

  return result;
}
