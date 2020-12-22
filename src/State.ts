import { none } from "@aicacia/core";
import type { IJSONObject } from "@aicacia/json";
import { EventEmitter } from "events";
import { fromJS, RecordOf } from "immutable";
import type { IExtractRecordOf } from "./IExtractRecordOf";

// tslint:disable-next-line: interface-name
export interface State<T extends RecordOf<any>> {
  on(
    event: "change",
    listener: (state: T, path: string[], action: string) => void
  ): this;
  addEventListener(
    event: "change",
    listener: (state: T, path: string[], action: string) => void
  ): this;
  off(
    event: "change",
    listener: (state: T, path: string[], action: string) => void
  ): this;
  off(event: "change"): this;
  removeEventListener(
    event: "change",
    listener: (state: T, path: string[], action: string) => void
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

  getView<K extends Extract<keyof IExtractRecordOf<T>, string>>(
    key: K
  ): View<T, any, RecordOf<IExtractRecordOf<T>[K]>> {
    return new View(this, key, none());
  }

  set(newState: T, path: string[] = [], action?: string) {
    this.current = newState;
    this.emit("change", this.current, path, action);
    return this;
  }
  update(updateFn: (state: T) => T, path: string[] = [], action?: string) {
    return this.set(updateFn(this.current), path, action);
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
