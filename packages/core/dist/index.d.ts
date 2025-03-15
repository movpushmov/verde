export declare interface Action<Params, Done, Fail = Error> {
    (params: Params): Promise<Done>;
    done: Event_2<{
        params: Params;
        result: Done;
    }>;
    fail: Event_2<{
        params: Params;
        result: Fail;
    }>;
    doneData: Event_2<Done>;
    failData: Event_2<Fail>;
}

export declare function createAction<Params, Done, Fail = Error>(handler: (params: Params) => Done | Promise<Done>): Action<Params, Done, Fail>;

export declare function createEvent<T>(): EventCallable<T>;

export declare function createRegion(handler: () => void): Region;

export declare function createScope(): Scope;

export declare function createStore<T>(defaultValue: T): Store<T>;

declare interface Event_2<Payload> {
    map: <T>(map: (payload: Payload) => T) => Event_2<T>;
    filter: (filter: (payload: Payload) => boolean) => Event_2<Payload>;
    on: (handler: EventHandler<Payload>) => void;
}
export { Event_2 as Event }

export declare interface EventCallable<Payload> extends Event_2<Payload> {
    (payload: Payload): void;
}

declare type EventHandler<Payload> = (payload: Payload) => void;

export declare const is: {
    store<Value = unknown>(object: unknown): object is Store<Value>;
    event<Payload = unknown>(object: unknown): object is Event_2<Payload>;
    action<Params = unknown, Done = unknown, Fail = Error>(object: unknown): object is Action<Params, Done, Fail>;
    region(object: unknown): object is Region;
    scope(object: unknown): object is Scope;
};

export declare interface Region {
    destroy: () => void;
}

export declare interface Scope {
    values: WeakMap<Store<unknown>, unknown>;
    touch: <T>(unit: Store<T> | EventCallable<T> | Action<T, unknown>, payload: T) => Promise<void>;
    get: <T>(store: Store<T>) => T;
}

export declare interface Store<Value> {
    defaultValue: Value;
    changed: Event_2<Value>;
    sid?: string;
}

export { }
