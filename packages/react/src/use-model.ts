import type { Model, ModelState } from '@verde/core';
import { useMemo } from 'react';
import { useUnit } from './use-unit';
import { is } from './utils';

export function useModel<State extends ModelState>(constructor: Model<State>) {
  const model = useMemo(() => constructor(), []);

  if (!is.supportedShape(model)) {
    throw '[useMode] Unsupported units in model. Allowed units: store, callable event and action.';
  }

  return useUnit(model);
}
