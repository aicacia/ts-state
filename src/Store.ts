import type { IJSONObject } from "@aicacia/json";
import type { IStringKeyOf } from "./IStringKeyOf";
import type { State } from "./State";
import { EventEmitter } from "events";

// tslint:disable-next-line: interface-name
export interface Store<S, T extends S[IStringKeyOf<S>]> extends EventEmitter {
  on(event: "change", listener: (state: T, action?: string) => void): this;
  addListener(
    event: "change",
    listener: (state: T, action?: string) => void
  ): this;
  off(event: "change", listener: (state: T, action?: string) => void): this;
  off(event: "change"): this;
  removeListener(
    event: "change",
    listener: (state: T, action?: string) => void
  ): this;
  removeAllListeners(event: "change"): this;
}

export type IFromJSON<T> = (json: IJSONObject) => T;

export class Store<S, T extends S[IStringKeyOf<S>]> extends EventEmitter {
  private state: State<S>;
  private name: IStringKeyOf<S>;
  private internalFromJSON: IFromJSON<T>;

  constructor(
    state: State<S>,
    name: IStringKeyOf<S>,
    internalFromJSON: IFromJSON<T>
  ) {
    super();

    this.state = state;
    this.name = name;
    this.internalFromJSON = internalFromJSON;
  }

  getName() {
    return this.name;
  }
  getCurrent(): T {
    return this.state.getCurrent().get(this.name) as T;
  }
  set(newState: T, action?: string) {
    this.state.setFor(
      this.name,
      this.state.getCurrent().set(this.name, newState),
      action
    );
    this.emit("change", this.getCurrent(), action);
    return this;
  }
  setFromJSON(json: IJSONObject) {
    return this.set(this.fromJSON(json), "fromJSON");
  }
  update(updateFn: (state: T) => T, action?: string) {
    return this.set(updateFn(this.getCurrent()), action);
  }

  toJSON(): T {
    return this.getCurrent();
  }
  fromJSON(json: IJSONObject) {
    return this.internalFromJSON(json);
  }
}
