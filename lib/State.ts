import EventEmitter = require("events");
import { Store } from "./Store";

export type IState =
    | {
          [key: string]: IState;
      }
    | any;

export type IStores = {
    [key: string]: any;
};

export class State extends EventEmitter {
    private _state: IState;
    private _stores: IStores;

    constructor() {
        super();

        this._state = {};
        this._stores = {};
    }

    createStore<S = IState>(name: string, initialState?: S): Store<S> {
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

    removeStore<S = IState>(name: string): Store<S> {
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

    getStore<S = IState>(name: string): Store<S> {
        return this._stores[name];
    }

    getStateFor<S = IState>(name: string): S {
        return this._state[name] as S;
    }

    getState(): IState {
        return this._state;
    }

    setStateFor<S = IState>(name: string, state: S): State {
        return this._setStateFor(name, state, true);
    }

    setState(state: IState): State {
        return this._setState(state, true);
    }

    noEmitSetStateFor<S = IState>(name: string, state: S): State {
        return this._setStateFor(name, state, false);
    }

    noEmitSetState(state: IState): State {
        return this._setState(state, false);
    }

    toJSON(): any {
        return this.getState();
    }

    fromJSON(json: any): IState {
        return Object.keys(json).reduce((state, name) => {
            const store = this.getStore(name),
                storeJSON = json[name];

            if (store && storeJSON) {
                state[name] = store.fromJSON(storeJSON);
            }

            return state;
        }, this._state);
    }

    setStateJSON(json: any): State {
        return this.setState(this.fromJSON(json));
    }

    noEmitSetStateJSON(json: any): State {
        return this.noEmitSetState(this.fromJSON(json));
    }

    private _setStateFor<S = IState>(
        name: string,
        state: S,
        emit: boolean = true
    ): State {
        const nextState: IState = { ...this._state };

        nextState[name] = state as any;

        this._setState(nextState, emit);

        if (emit) {
            this.emit("set-state-for", name, state);
        }

        return this;
    }

    private _setState(state: IState, emit: boolean = true): State {
        this._state = state;

        if (emit) {
            this.emit("set-state", state);
        }

        return this;
    }
}
