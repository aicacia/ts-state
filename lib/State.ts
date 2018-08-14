import EventEmitter = require("events");
import { Store } from "./Store";

export class State extends EventEmitter {
    private _state: { [key: string]: any };
    private _stores: { [key: string]: Store };

    constructor() {
        super();

        this._state = {};
        this._stores = {};
    }

    createStore<T>(name: string, initialState?: T): Store<T> {
        const store = new Store(this, name),
            state = { ...this._state },
            stores = { ...this._stores };

        state[name] = initialState || {};
        stores[name] = store;

        this._state = state;
        this._stores = stores;

        this.emit("create-store", store);

        return store;
    }

    removeStore(name: string): Store | null {
        const store = this.getStore(name);

        if (store !== null) {
            const state = { ...this._state },
                stores = { ...this._stores };

            delete state[name];
            delete stores[name];

            this._state = state;
            this._stores = stores;

            this.emit("delete-store", store);
        }

        return store;
    }

    getStore(name: string): Store | null {
        return this._stores[name] || null;
    }

    getStateFor(name: string): any {
        return this._state[name] || {};
    }

    getState(): { [key: string]: any } {
        return this._state;
    }

    setStateFor(name: string, state: any): State {
        return this._setStateFor("set-state-for", "set-state", name, state);
    }

    setState(state: any): State {
        return this._setState("set-state", state);
    }

    unsafeSetStateFor(name: string, state: any): State {
        return this._setStateFor(
            "unsafe-set-state-for",
            "unsafe-set-state",
            name,
            state
        );
    }

    unsafeSetState(state: any): State {
        return this._setState("unsafe-set-state", state);
    }

    private _setStateFor(
        event: string,
        rootEvent: string,
        name: string,
        state: any
    ): State {
        const nextState = { ...this._state };

        this.emit(event, name, state);
        nextState[name] = state;

        return this._setState(rootEvent, nextState);
    }

    private _setState(event: string, state: any): State {
        this.emit(event, state);
        this._state = state;
        return this;
    }
}
