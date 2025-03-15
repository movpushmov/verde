import { createEvent } from './event';
import { react } from './react';
import { createStore } from './store';

export function createGate<T>() {
  const $state = createStore<T | null>(null);
  const $isOpened = createStore(false);

  const open = createEvent<T>();
  const close = createEvent();

  const opened = createEvent<T>();
  const closed = createEvent();

  react({
    clock: open,
    target: (scope, payload) => {
      scope.touch($state, payload);
      scope.touch($isOpened, true);
      scope.touch(opened, payload);
    },
  });

  react({
    clock: close,
    target: (scope) => {
      scope.touch($state, null);
      scope.touch($isOpened, false);
      scope.touch(closed);
    },
  });

  return { $state, $isOpened, open, close, opened, closed };
}
