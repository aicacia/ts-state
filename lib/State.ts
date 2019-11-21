import { IJSONObject, isJSON } from "@stembord/json";
import { EventEmitter } from "events";
import { Record } from "immutable";

type IStores<S extends {}> = {
  [K in Extract<keyof S, string>]: Store<State<S>, S[K]>;
};

export class State<S extends {}> extends EventEmitter {
  private State: Record.Factory<S>;
  private Stores: Record.Factory<IStores<S>>;
  private current: Record<S>;
  private stores: Record<IStores<S>>;

  constructor(initialState: S) {
    super();

    this.State = Record(initialState);
    this.current = this.State();
    this.Stores = Record(
      this.current.toSeq().reduce((initialStores: IStores<S>, _, key) => {
        const name: Extract<keyof S, string> = key as any;
        initialStores[name] = new Store(this, name) as any;
        return initialStores;
      }, {} as any)
    );
    this.stores = this.Stores();
  }

  resetState() {
    this.current = this.State();
    return this;
  }
  resetStateFor<K extends Extract<keyof S, string>>(name: K) {
    const initialState = this.State();
    this.current.set(name, initialState.get(name));
    return this;
  }

  getStore<K extends Extract<keyof S, string>>(name: K): Store<State<S>, S[K]> {
    return this.stores.get(name);
  }

  getStateFor<K extends keyof S>(name: K): S[K] {
    return this.current.get(name);
  }

  getState(): Record<S> {
    return this.current;
  }

  setStateFor<K extends Extract<keyof S, string>, M = any>(
    name: K,
    state: S[K],
    meta?: M
  ): State<S> {
    return this.internalSetStateFor(name, state, meta, true);
  }

  setState<M = any>(state: Record<S>, meta?: M): State<S> {
    return this.internalSetState(state, meta, true);
  }

  noEmitSetStateFor<K extends Extract<keyof S, string>, M = any>(
    name: K,
    state: S[K],
    meta?: M
  ): State<S> {
    return this.internalSetStateFor(name, state, meta, false);
  }

  noEmitSetState(state: Record<S>): State<S> {
    return this.internalSetState(state, false);
  }

  toJS(): { [K in Extract<keyof S, string>]: S[K] } {
    return this.stores.toSeq().reduce((js, store, name) => {
      js[name] = store.toJS();
      return js;
    }, {} as any);
  }

  toJSON(): IJSONObject {
    return this.stores.toSeq().reduce((json: IJSONObject, store, name) => {
      json[name] = store.toJSON();
      return json;
    }, {} as any);
  }

  fromJSON(json: IJSONObject) {
    return Object.keys(json).reduce((state, name) => {
      const store = this.getStore(name as Extract<keyof S, string>),
        storeJSON = json[name];

      if (store && isJSON(storeJSON)) {
        state = state.set(
          name as Extract<keyof S, string>,
          store.fromJSON(storeJSON)
        );
      }

      return state;
    }, this.current);
  }

  setStateJSON(json: IJSONObject) {
    return this.setState(this.fromJSON(json));
  }

  noEmitSetStateJSON(json: IJSONObject) {
    return this.noEmitSetState(this.fromJSON(json));
  }

  internalSetStateFor<K extends Extract<keyof S, string>, M = any>(
    name: K,
    state: S[K],
    meta?: M,
    emit: boolean = true
  ): State<S> {
    const nextState = this.current.set(name, state);

    this.internalSetState(nextState, meta, emit);

    if (emit) {
      this.emit("set-state-for", name, state, meta);
    }

    return this;
  }

  internalSetState<M = any>(
    state: Record<S>,
    meta?: M,
    emit: boolean = true
  ): State<S> {
    this.current = state;

    if (emit) {
      this.emit("set-state", state, meta);
    }

    return this;
  }
}

import { Store } from "./Store";
