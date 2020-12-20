import { none } from "@aicacia/core";
import type { IJSONObject } from "@aicacia/json";
import { EventEmitter } from "events";
import { fromJS, RecordOf } from "immutable";
import type { ExtractRecordOf } from "./IExtractRecordOf";

// tslint:disable-next-line: interface-name
export interface State<T extends RecordOf<any>> {
  on(event: "change", listener: (this: this, state: T) => void): this;
  addEventListener(
    event: "change",
    listener: (this: this, state: T) => void
  ): this;
  off(event: "change", listener: (this: this, state: T) => void): this;
  off(event: "change"): this;
  removeEventListener(
    event: "change",
    listener: (this: this, state: T) => void
  ): this;
  removeEventListener(event: "change"): this;
}

export class State<T extends RecordOf<any>> extends EventEmitter {
  private current: T;

  constructor(initialState: T) {
    super();

    this.current = initialState;
  }

  getCurrent() {
    return this.current;
  }

  getView<K extends Extract<keyof ExtractRecordOf<T>, string>>(
    key: K
  ): View<T, any, RecordOf<ExtractRecordOf<T>[K]>> {
    return new View(this, key, none());
  }

  set(newState: T) {
    this.current = newState;
    this.emit("set", this.current);
    return this;
  }
  update(updateFn: (state: T) => T) {
    return this.set(updateFn(this.current));
  }

  toJSON(): IJSONObject {
    return this.current.toJS();
  }
  fromJSON(json: IJSONObject) {
    this.current = fromJS(json);
    return this;
  }
}

import { View } from "./View";
