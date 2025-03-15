import {
  Action,
  ComputedApi,
  Event,
  EventCallable,
  ModelFactory,
  ModelShape,
  ModelState,
  Scope,
  Store,
  StoreWritable,
  Subscription,
  Unit,
  Watcher,
} from './types';

export const symbols = {
  store: Symbol('store'),
  event: Symbol('event'),
  action: Symbol('action'),
  scope: Symbol('scope'),
  model: Symbol('model'),
};

export class Context {
  private stack: Watcher[] = [];
  private watcher?: Watcher | undefined;

  private _isFabricContext: boolean = false;

  createWatcher(on: Watcher) {
    if (this.watcher) {
      this.stack.push(this.watcher);
    }

    this.watcher = on;

    return {
      cancel: () => {
        this.watcher = this.stack.pop();
      },
    };
  }

  registerUnits(...units: Unit[]) {
    for (const unit of units) {
      this.watcher?.({ type: 'unit', unit });
    }
  }

  registerSubscription(subscription: Subscription) {
    this.watcher?.({ type: 'subscription', subscription });
  }

  defineModel<Params, State extends ModelShape>(
    modelFactory: ModelFactory<Params, State>,
    params: Params,
  ): ModelState<State> {
    const subscriptions: Subscription[] = [];
    const watcher = this.createWatcher((payload) => {
      if (payload.type === 'subscription') {
        subscriptions.push(payload.subscription);
      }
    });

    const destroyHandlers: (() => void)[] = [];

    const prevContext = this._isFabricContext;

    this._isFabricContext = true;

    const model = modelFactory(params, {
      onDestroy: (handler) => destroyHandlers.push(handler),
    });

    this._isFabricContext = prevContext;

    watcher.cancel();

    return {
      ...model,

      $$type: symbols.model,
      $$destroy: () => {
        for (const subscription of subscriptions) {
          subscription.cancel();
        }
      },
    };
  }

  public get isFabricContext() {
    return this._isFabricContext;
  }

  private set isFabricContext(value) {
    this._isFabricContext = value;
  }
}

export const ctx = new Context();

export const api = {
  computed<R>(store: Store<R>) {
    return store as unknown as ComputedApi<R>;
  },
};

export const is = {
  writableStore<Value = unknown>(
    object: unknown,
  ): object is StoreWritable<Value> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.store &&
      'writable' in object &&
      object.writable == true
    );
  },

  computedStore<Value = unknown>(object: unknown): object is Store<Value> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.store &&
      !('writable' in object)
    );
  },

  mappedEvent<Payload = unknown>(object: unknown): object is Event<Payload> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.event &&
      !('callable' in object)
    );
  },

  callableEvent<Payload = unknown>(
    object: unknown,
  ): object is EventCallable<Payload> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.event &&
      'callable' in object &&
      object.callable == true
    );
  },

  action<Params = unknown, Done = unknown, Fail = Error>(
    object: unknown,
  ): object is Action<Params, Done, Fail> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.action
    );
  },

  scope(object: unknown): object is Scope {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.scope
    );
  },

  model<Shape extends ModelShape>(
    object: unknown,
  ): object is ModelState<Shape> {
    return (
      object !== null &&
      typeof object === 'object' &&
      '$$type' in object &&
      object.$$type === symbols.model
    );
  },
};
