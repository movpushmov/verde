import { createEvent } from "./event";
import { Action, TouchContext } from "./types";
import { registerUnits, symbols } from "./utils";

export function createAction<Params, Done, Fail = Error>(
  handler: (params: Params) => Promise<Done>,
): Action<Params, Done, Fail> {
  const done = createEvent<{ params: Params; result: Done }>();
  const fail = createEvent<{ params: Params; result: Fail }>();

  const doneData = createEvent<Done>();
  const failData = createEvent<Fail>();

  const action: Action<Params, Done, Fail> = Object.assign(
    async function (this: TouchContext, params: Params) {
      return handler(params)
        .then((result) => {
          this.scope.touch(done, { params, result });
          this.scope.touch(doneData, result);

          return result;
        })
        .catch((e) => {
          const result = e as Fail;

          this.scope.touch(fail, { params, result });
          this.scope.touch(failData, result);

          return Promise.reject(result);
        });
    },
    {
      $$type: symbols.action,

      fail,
      failData,

      done,
      doneData,

      derivedUnits: [done, fail, doneData, failData],
      clearHandler() {},
    },
  );

  registerUnits(action);

  return action;
}
