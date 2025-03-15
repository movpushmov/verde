import { createScope } from './scope';
import type { Model, ModelState, Scope } from './types';
import { is } from './utils';

function bindModel<State extends ModelState>(
  scope: Scope,
  state: State,
): State {
  const result = {} as State;

  function walk(source: any, key: string, result: any) {
    if (
      is.writableStore(source) ||
      is.action(source) ||
      is.callableEvent(source)
    ) {
      result[key] = source.scopeBind(scope);
      return;
    }

    if (is.computedStore(source) || is.mappedEvent(source)) {
      result[key] = source;
      return;
    }

    if (typeof source === 'object') {
      result[key] = {};

      for (const subKey in source) {
        walk(source[subKey], subKey, result[key]);
      }

      return;
    }

    result[key] = source;
    return;
  }

  for (const key in state) {
    walk(state, key, result);
  }

  return result;
}

export function createModel<State extends ModelState>(
  constructor: Model<State>,
): Model<State> {
  const state = constructor();

  return () => bindModel(createScope(), state);
}
