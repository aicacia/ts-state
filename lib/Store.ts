import { IJSON } from "@stembord/json";
import { EventEmitter } from "events";

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

import { State } from "./State";
