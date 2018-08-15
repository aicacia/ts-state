import EventEmitter = require("events");
import { Store } from "./Store";
import { IState } from "./IState";

export class State<S = IState> extends EventEmitter {
    private _state: { [key: string]: any };
    private _stores: { [key: string]: Store };

    constructor() {
        super();

        this._state = {};
        this._stores = {};
    }

    createStore<SS = IState>(name: string, initialState?: SS): Store<S, SS> {
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

    removeStore<SS = IState>(name: string): Store<S, SS> | null {
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

    getStore<SS = IState>(name: string): Store<SS> | null {
        return this._stores[name] || null;
    }

    getStateFor<SS = IState>(name: string): SS {
        return this._state[name] || {};
    }

    getState(): S {
        return <S>this._state;
    }

    setStateFor<SS = IState>(name: string, state: SS): State<S> {
        return this._setStateFor(name, state);
    }

    setState(state: S): State<S> {
        return this._setState(state);
    }

    noEmitSetStateFor<SS = IState>(name: string, state: SS): State<S> {
        return this._setStateFor(name, state, false);
    }

    noEmitSetState(state: S): State<S> {
        return this._setState(state, false);
    }

    private _setStateFor<SS = IState>(
        name: string,
        state: SS,
        emit: boolean = true
    ): State {
        const nextState = { ...this._state };

        if (emit) {
            this.emit("set-state-for", name, state);
        }
        nextState[name] = state;

        return this._setState(<S>nextState, emit);
    }

    private _setState(state: S, emit: boolean = true): State<S> {
        if (emit) {
            this.emit("set-state", state);
        }
        this._state = state;
        return this;
    }
}
