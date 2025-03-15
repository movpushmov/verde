import { createEvent } from './event';
import { watch } from './watch';
import { Action, Scope } from './types';
import { ctx, symbols } from './utils';

export function createAction<Params, Done, Fail = Error>(
  handler: (params: Params) => Promise<Done>,
): Action<Params, Done, Fail> {
  const done = createEvent<{ params: Params; result: Done }>();
  const fail = createEvent<{ params: Params; result: Fail }>();

  const doneData = createEvent<Done>();
  const failData = createEvent<Fail>();

  const base = createEvent<Params>();
  const mock = createEvent<(params: Params) => Promise<Done>>();

  const action: Action<Params, Done, Fail> = Object.assign(
    (scope: Scope, params: Params) => {
      const actionHandler = scope.getHandler(action) ?? handler;

      return actionHandler(params)
        .then((result) => {
          scope.touch(done, { params, result });
          scope.touch(doneData, result);

          return result;
        })
        .catch((e) => {
          const result = e as Fail;

          scope.touch(fail, { params, result });
          scope.touch(failData, result);

          return Promise.reject(result);
        });
    },
    {
      $$type: symbols.action,

      fail,
      failData,

      done,
      doneData,

      on: base.on.bind(base),
      filter: base.filter.bind(base),
      map: base.map.bind(base),

      mock,

      derivedUnits: [done, fail, doneData, failData],

      get hasSubscribers() {
        return base.hasSubscribers;
      },
    } as const,
  );

  watch({
    on: mock,
    do: (scope, handler) => scope.mockHandler(action, handler),
  });

  ctx.registerUnits(action);

  return action;
}
