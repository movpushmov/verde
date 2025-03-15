import { createEvent } from './event';
import { watch } from './watch';
import { createStore } from './store';

export function createGate<T>() {
  const $state = createStore<T | null>(null);
  const $isOpened = createStore(false);

  const open = createEvent<T>();
  const close = createEvent();

  const opened = createEvent<T>();
  const closed = createEvent();

  watch({
    on: open,
    do: (scope, payload) => {
      scope.touch($state, payload);
      scope.touch($isOpened, true);
      scope.touch(opened, payload);
    },
  });

  watch({
    on: close,
    do: (scope) => {
      scope.touch($state, null);
      scope.touch($isOpened, false);
      scope.touch(closed);
    },
  });

  return { $state, $isOpened, open, close, opened, closed };
}
