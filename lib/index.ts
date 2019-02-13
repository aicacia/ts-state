import { EventEmitter } from "events";
import { Record } from "immutable";

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
  RecordFactory: Record.Factory<S>;
  current: Record<S>;
  stores: IStores<S>;

  constructor(initialState: S) {
    super();

    this.RecordFactory = Record(initialState);
    this.current = this.RecordFactory();

    const state = this.current.toJS(),
      stores: IStores<S> = {} as any;

    for (const key in state) {
      if (state.hasOwnProperty(key)) {
        (stores as any)[key] = new Store(this, key);
      }
    }

    this.stores = stores;
  }

  getStore<K extends Extract<keyof S, string>>(name: K): Store<State<S>, S[K]> {
    return this.stores[name];
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

  toJSON(): any {
    return this.getState().toJSON();
  }

  fromJSON(json: any): Record<S> {
    return Object.keys(json).reduce((state, name) => {
      const store = this.getStore(name as any),
        storeJSON = json[name];

      if (store && storeJSON) {
        state = state.set(name, store.fromJSON(storeJSON));
      }

      return state;
    }, this.RecordFactory());
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
