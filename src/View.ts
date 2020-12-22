import { none, Option, some } from "@aicacia/core";
import type { IJSONObject } from "@aicacia/json";
import { EventEmitter } from "events";
import type { RecordOf } from "immutable";
import type { IExtractRecordOf } from "./IExtractRecordOf";

// tslint:disable-next-line: interface-name
export interface View<
  S extends RecordOf<any>,
  P extends RecordOf<any>,
  T extends RecordOf<any>
> {
  on(event: "change", listener: (state: T, path: string[]) => void): this;
  addEventListener(
    event: "change",
    listener: (state: T, path: string[]) => void
  ): this;
  off(event: "change", listener: (state: T, path: string[]) => void): this;
  off(event: "change"): this;
  removeEventListener(
    event: "change",
    listener: (state: T, path: string[]) => void
  ): this;
  removeEventListener(event: "change"): this;
}

export class View<
  S extends RecordOf<any>,
  P extends RecordOf<any>,
  T extends RecordOf<any>
> extends EventEmitter {
  state: State<S>;
  key: Extract<keyof IExtractRecordOf<P>, string>;
  parent: Option<View<S, any, P>>;
  path: string[];

  constructor(
    state: State<S>,
    key: Extract<keyof IExtractRecordOf<P>, string>,
    parent: Option<View<S, any, P>> = none()
  ) {
    super();

    this.state = state;
    this.key = key;
    this.parent = parent;
    this.path = getPath(this.key, this.parent);
  }

  getCurrent(): T {
    return this.state.getCurrent().getIn(this.path);
  }
  set(newState: T) {
    this.state.set(
      this.state.getCurrent().setIn(this.path, newState),
      this.path
    );
    this.emit("change", this.getCurrent());
    return this;
  }
  update(updateFn: (state: T) => T) {
    return this.set(updateFn(this.getCurrent()));
  }

  getView<K extends Extract<keyof IExtractRecordOf<T>, string>>(
    key: K
  ): View<S, T, IExtractRecordOf<T>[K]> {
    return new View(this.state, key, some(this));
  }

  toJSON(): IJSONObject {
    return this.getCurrent().toJS();
  }
}

function getPath(
  key: string,
  parentOption: Option<View<any, any, any>>
): string[] {
  const path: string[] = [key];

  while (parentOption.isSome()) {
    const parent = parentOption.unwrap();
    path.unshift(parent.key);
    parentOption = parent.parent;
  }

  return path;
}

import { State } from "./State";
