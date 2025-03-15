import { createEvent } from './event';
import { react } from './react';
import { Action, Scope } from './types';
import { registerUnits, symbols } from './utils';

export function createAction<Params, Done, Fail = Error>(
  handler: (params: Params) => Promise<Done>,
): Action<Params, Done, Fail> {
  const done = createEvent<{ params: Params; result: Done }>();
  const fail = createEvent<{ params: Params; result: Fail }>();

  const doneData = createEvent<Done>();
  const failData = createEvent<Fail>();

  const base = createEvent<Params>();
  const mock = createEvent<(params: Params) => Promise<Done>>();

  function getSignature(forceScope?: Scope) {
    return (scope: Scope, params: Params) => {
      const currentScope = forceScope ?? scope;
      const actionHandler = currentScope.getHandler(action) ?? handler;

      return actionHandler(params)
        .then((result) => {
          currentScope.touch(done, { params, result });
          currentScope.touch(doneData, result);

          return result;
        })
        .catch((e) => {
          const result = e as Fail;

          currentScope.touch(fail, { params, result });
          currentScope.touch(failData, result);

          return Promise.reject(result);
        });
    };
  }

  const baseBody = {
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

    scopeBind: (forceScope?: Scope) =>
      Object.assign(getSignature(forceScope), baseBody),

    get hasSubscribers() {
      return base.hasSubscribers;
    },
  } as const;

  const action: Action<Params, Done, Fail> = Object.assign(
    getSignature(),
    baseBody,
  );

  react({
    clock: mock,
    target: (scope, handler) => scope.mockHandler(action, handler),
  });

  registerUnits(action);

  return action;
}
