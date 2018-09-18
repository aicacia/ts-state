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
    state: IState;
    stores: IStores;

    constructor() {
        super();

        this.state = {};
        this.stores = {};
    }

    createStore<S = IState>(name: string, initialState?: S): Store<S> {
        const store = new Store(this, name),
            state = { ...this.state },
            stores = { ...this.stores };

        state[name] = initialState || {};
        stores[name] = store;

        this.state = state;
        this.stores = stores;

        this.emit("create-store", store);

        return store;
    }

    removeStore<S = IState>(name: string): Store<S> {
        const store = this.getStore(name);

        if (store != null) {
            const state = { ...this.state },
                stores = { ...this.stores };

            delete state[name];
            delete stores[name];

            this.state = state;
            this.stores = stores;

            this.emit("delete-store", store);
        }

        return store;
    }

    getStore<S = IState>(name: string): Store<S> {
        return this.stores[name];
    }

    getStateFor<S = IState>(name: string): S {
        return this.state[name] as S;
    }

    getState(): IState {
        return this.state;
    }

    setStateFor<S = IState>(name: string, state: S): State {
        return this.internalSetStateFor(name, state, true);
    }

    setState(state: IState): State {
        return this.internalSetState(state, true);
    }

    noEmitSetStateFor<S = IState>(name: string, state: S): State {
        return this.internalSetStateFor(name, state, false);
    }

    noEmitSetState(state: IState): State {
        return this.internalSetState(state, false);
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
        }, this.state);
    }

    setStateJSON(json: any): State {
        return this.setState(this.fromJSON(json));
    }

    noEmitSetStateJSON(json: any): State {
        return this.noEmitSetState(this.fromJSON(json));
    }

    internalSetStateFor<S = IState>(
        name: string,
        state: S,
        emit: boolean = true
    ): State {
        const nextState: IState = { ...this.state };

        nextState[name] = state as any;

        this.internalSetState(nextState, emit);

        if (emit) {
            this.emit("set-state-for", name, state);
        }

        return this;
    }

    internalSetState(state: IState, emit: boolean = true): State {
        this.state = state;

        if (emit) {
            this.emit("set-state", state);
        }

        return this;
    }
}
