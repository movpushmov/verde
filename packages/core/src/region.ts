import { ExtendedUnit, Region, Unit } from "./types";
import { createWatcher, registerUnits, symbols } from "./utils";

export function createRegion(handler: () => void): Region {
  const units: Unit[] = [];
  const { cancel } = createWatcher((unit) => units.push(unit));

  handler();
  cancel();

  function destroyUnitsTree(root: ExtendedUnit) {
    const queue: ExtendedUnit[] = [root];

    while (queue.length) {
      const unit = queue.shift()!;

      unit.clearHandlers();
      queue.push(...unit.derivedUnits);
    }
  }

  const region = {
    $$type: symbols.region,
    destroy() {
      for (const unit of units) {
        destroyUnitsTree(unit as ExtendedUnit);
      }
    },
  } as Region;

  registerUnits(region);

  return region;
}
