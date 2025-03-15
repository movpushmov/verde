import { describe, test, expect, vi } from 'vitest';
import { createAction, createEvent, createScope, createStore } from '../src';

describe('scope', () => {
  test('store value', async () => {
    const scope = createScope();

    const store = createStore(5);

    const fn = vi.fn();
    store.changed.on(fn);

    expect(scope.get(store)).toBe(5);
    expect(fn).not.toBeCalled();

    scope.touch(store, 10);

    expect(scope.get(store)).toBe(10);
    expect(fn).toBeCalled();
  });

  test('event', async () => {
    const scope = createScope();

    const event = createEvent<number>();
    const fn = vi.fn();

    event.on(fn);

    scope.touch(event, 1);

    expect(fn).toBeCalledWith(1);

    scope.touch(event, 2);

    expect(fn).toBeCalledWith(2);
  });

  test('action', async () => {
    const scope = createScope();

    const action = createAction<number, boolean>(
      vi.fn().mockResolvedValueOnce(true).mockRejectedValueOnce(false),
    );

    const doneFn = vi.fn();
    const failFn = vi.fn();
    const doneDataFn = vi.fn();
    const failDataFn = vi.fn();

    action.done.on(doneFn);
    action.fail.on(failFn);
    action.doneData.on(doneDataFn);
    action.failData.on(failDataFn);

    scope.touch(action, 1);

    await vi.waitFor(() => expect(doneFn).toBeCalled());

    expect(doneFn).toBeCalledWith({ params: 1, result: true });
    expect(doneDataFn).toBeCalledWith(true);

    scope.touch(action, 2);

    await vi.waitFor(() => expect(failFn).toBeCalled());

    expect(failFn).toBeCalledWith({ params: 2, result: false });
    expect(failDataFn).toBeCalledWith(false);
  });
});
