import {
  is,
  watch,
  type Model,
  type ModelShape,
  type Store,
  type StoreWritable,
} from '@verde/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactiveModel } from './types';
import { useScope } from './use-scope';

export function useModel<Params, State extends ModelShape>(
  modelFactory: Model<Params, State>,
  params: Params,
): ReactiveModel<State> {
  const { $$destroy: destroy, ...model } = useMemo(
    () => modelFactory(params),
    [params],
  );

  useEffect(() => () => destroy(), [params]);

  const scope = useScope();
  const stores = useRef<(Store<any> | StoreWritable<any>)[]>([]);
  const [updater, update] = useState(0);

  const result = useMemo(() => {
    function map(shape: Record<string, any>, path: string[] = []) {
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

        if (is.model(unit)) {
          path.push(key);
          res[key] = map(unit, path);
        }

        throw `[useModel] Unsupported unit ${path.join('.')}`;
      }

      return res;
    }

    return map(model);
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
