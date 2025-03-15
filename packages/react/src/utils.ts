import { is as coreIs } from '@verde/core';
import { SupportedUnit } from './types';

export const is = {
  supportedShape(
    shape: Record<string, unknown>,
  ): shape is Record<string, SupportedUnit> {
    for (const key in shape) {
      const unit = shape[key];

      if (
        coreIs.action(unit) ||
        coreIs.computedStore(unit) ||
        coreIs.writableStore(unit) ||
        coreIs.callableEvent(unit)
      ) {
        continue;
      }

      return false;
    }

    return true;
  },

  supportedModelShape(
    shape: Record<string, unknown>,
  ): shape is Record<string, SupportedUnit> {
    for (const key in shape) {
      const unit = shape[key];

      if (
        coreIs.action(unit) ||
        coreIs.computedStore(unit) ||
        coreIs.writableStore(unit) ||
        coreIs.callableEvent(unit)
      ) {
        continue;
      }

      return false;
    }

    return true;
  },
};
