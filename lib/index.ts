import { IJSON, IJSONObject } from "@stembord/json";
import { EventEmitter } from "events";
import { Record } from "immutable";

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

  setState(state: T, meta?: any): Store<S, T> {
    this.emit("set-state", state);
    this.state.setStateFor(this.name, state as any, meta);
    return this;
  }

  updateState(fn: (prev: T) => T, meta?: any): Store<S, T> {
    return this.setState(fn(this.getState()), meta || fn.name);
  }

  noEmitSetState(state: T): Store<S, T> {
    this.state.noEmitSetStateFor(this.name, state as any);
    return this;
  }

  noEmitUpdateState(fn: (prev: T) => T): Store<S, T> {
    return this.noEmitSetState(fn(this.getState()));
  }

  toJSON(): IJSON {
    return this.getState() as any;
  }

  fromJSON(json: IJSON): T {
    return json as any;
  }

  setStateJSON(json: IJSON): Store<S, T> {
    return this.setState(this.fromJSON(json));
  }

  noEmitSetStateJSON(json: IJSON): Store<S, T> {
    return this.noEmitSetState(this.fromJSON(json));
  }
}

type IStores<S> = { [K in Extract<keyof S, string>]: Store<State<S>, S[K]> };

export class State<S> extends EventEmitter {
  State: Record.Factory<S>;
  Stores: Record.Factory<IStores<S>>;
  current: Record<S>;
  stores: Record<IStores<S>>;

  constructor(initialState: S) {
    super();

    this.State = Record(initialState);
    this.current = this.State();

    const state = this.current.toJS(),
      initialStores: IStores<S> = {} as any;

    for (const key in state) {
      if (state.hasOwnProperty(key)) {
        initialStores[key] = new Store(this, key) as any;
      }
    }

    this.Stores = Record(initialStores);
    this.stores = this.Stores();
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

  setStateFor<K extends Extract<keyof S, string>>(
    name: K,
    state: S[K],
    meta?: any
  ): State<S> {
    return this.internalSetStateFor(name, state, meta, true);
  }

  setState(state: Record<S>, meta?: any): State<S> {
    return this.internalSetState(state, meta, true);
  }

  noEmitSetStateFor<K extends Extract<keyof S, string>>(
    name: K,
    state: S[K],
    meta?: any
  ): State<S> {
    return this.internalSetStateFor(name, state, meta, false);
  }

  noEmitSetState(state: Record<S>): State<S> {
    return this.internalSetState(state, false);
  }

  toJS(): S {
    return this.getState().toJS();
  }

  toJSON(): IJSONObject {
    return this.getState().toJSON() as any;
  }

  fromJSON(json: IJSONObject): Record<S> {
    return Object.keys(json).reduce((state, name) => {
      const store = this.getStore(name as Extract<keyof S, string>),
        storeJSON = json[name];

      if (store && storeJSON) {
        state = state.set(
          name as Extract<keyof S, string>,
          store.fromJSON(storeJSON)
        );
      }

      return state;
    }, this.State());
  }

  setStateJSON(json: IJSONObject): State<S> {
    return this.setState(this.fromJSON(json));
  }

  noEmitSetStateJSON(json: IJSONObject): State<S> {
    return this.noEmitSetState(this.fromJSON(json));
  }

  internalSetStateFor<K extends Extract<keyof S, string>>(
    name: K,
    state: S[K],
    meta?: any,
    emit: boolean = true
  ): State<S> {
    const nextState = this.current.set(name, state);

    this.internalSetState(nextState, meta, emit);

    if (emit) {
      this.emit("set-state-for", name, state, meta);
    }

    return this;
  }

  internalSetState(
    state: Record<S>,
    meta?: any,
    emit: boolean = true
  ): State<S> {
    this.current = state;

    if (emit) {
      this.emit("set-state", state, meta);
    }

    return this;
  }
}
