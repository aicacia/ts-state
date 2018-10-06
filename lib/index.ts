import { EventEmitter } from "events";

export type IStores<S> = {
    [K in Extract<keyof S, string>]: Store<State<S>, S[K]>
};

export class Store<S, T> extends EventEmitter {
    name: Extract<keyof S, string>;
    state: State<S>;

    constructor(state: State<S>, name: Extract<keyof S, string>) {
        super();

        this.name = name;
        this.state = state;
    }

    getName(): Extract<keyof S, string> {
        return this.name;
    }

    getState(): T {
        return this.state.getStateFor(this.name) as any;
    }

    setState(state: T): Store<S, T> {
        this.emit("set-state", state);
        this.state.setStateFor(this.name, state as any);
        return this;
    }

    updateState(fn: (prev: T) => T): Store<S, T> {
        return this.setState(fn(this.getState()));
    }

    noEmitSetState(state: T): Store<S, T> {
        this.state.noEmitSetStateFor(this.name, state as any);
        return this;
    }

    noEmitUpdateState(fn: (prev: T) => T): Store<S, T> {
        return this.noEmitSetState(fn(this.getState()));
    }

    toJSON(): any {
        return this.getState();
    }

    fromJSON(json: any): T {
        return json;
    }

    setStateJSON(json: any): Store<S, T> {
        return this.setState(this.fromJSON(json));
    }

    noEmitSetStateJSON(json: any): Store<S, T> {
        return this.noEmitSetState(this.fromJSON(json));
    }
}

export class State<S> extends EventEmitter {
    state: S;
    stores: IStores<S>;

    constructor(state: S) {
        super();

        const stores = {} as IStores<S>;

        for (let key in state) {
            (stores as any)[key] = new Store(this, key);
        }

        this.state = state;
        this.stores = stores;
    }

    getStore<K extends Extract<keyof S, string>>(
        name: K
    ): Store<State<S>, S[K]> {
        return this.stores[name];
    }

    getStateFor<K extends keyof S>(name: K): S[K] {
        return this.state[name];
    }

    getState(): S {
        return this.state;
    }

    setStateFor<K extends Extract<keyof S, string>>(
        name: K,
        state: S[K]
    ): State<S> {
        return this.internalSetStateFor(name, state, true);
    }

    setState(state: S): State<S> {
        return this.internalSetState(state, true);
    }

    noEmitSetStateFor<K extends Extract<keyof S, string>>(
        name: K,
        state: S[K]
    ): State<S> {
        return this.internalSetStateFor(name, state, false);
    }

    noEmitSetState(state: S): State<S> {
        return this.internalSetState(state, false);
    }

    toJSON(): S {
        return this.getState();
    }

    fromJSON(json: any): S {
        return Object.keys(json).reduce((state, name) => {
            const store = this.getStore(name as any),
                storeJSON = json[name];

            if (store && storeJSON) {
                (state as any)[name] = store.fromJSON(storeJSON);
            }

            return state;
        }, this.state);
    }

    setStateJSON(json: any): State<S> {
        return this.setState(this.fromJSON(json));
    }

    noEmitSetStateJSON(json: any): State<S> {
        return this.noEmitSetState(this.fromJSON(json));
    }

    internalSetStateFor<K extends Extract<keyof S, string>>(
        name: K,
        state: S[K],
        emit: boolean = true
    ): State<S> {
        const nextState: S = { ...(this.state as any) };

        nextState[name] = state as any;

        this.internalSetState(nextState, emit);

        if (emit) {
            this.emit("set-state-for", name, state);
        }

        return this;
    }

    internalSetState(state: S, emit: boolean = true): State<S> {
        this.state = state;

        if (emit) {
            this.emit("set-state", state);
        }

        return this;
    }
}
