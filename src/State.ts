import type { IJSONObject } from "@aicacia/json";
import type { IFromJSON } from "./Store";
import type { IStringKeyOf } from "./IStringKeyOf";
import { EventEmitter } from "events";
import { Record as ImmutableRecord, RecordOf } from "immutable";
import { Store } from "./Store";

// tslint:disable-next-line: interface-name
export interface State<T> extends EventEmitter {
  on(
    event: "change",
    listener: (state: RecordOf<T>, action?: string) => void
  ): this;
  on(
    event: "change-for",
    listener: (state: RecordOf<T>, name: string, action?: string) => void
  ): this;
  addListener(
    event: "change",
    listener: (state: RecordOf<T>, action?: string) => void
  ): this;
  addListener(
    event: "change-for",
    listener: (state: RecordOf<T>, name: string, action?: string) => void
  ): this;
  off(
    event: "change",
    listener: (state: RecordOf<T>, action?: string) => void
  ): this;
  off(
    event: "change-for",
    listener: (state: RecordOf<T>, name: string, action?: string) => void
  ): this;
  off(event: "change"): this;
  off(event: "change-for"): this;
  removeListener(
    event: "change",
    listener: (state: RecordOf<T>, action?: string) => void
  ): this;
  removeListener(
    event: "change-for",
    listener: (state: RecordOf<T>, name: string, action?: string) => void
  ): this;
  removeAllListeners(event: "change" | "change-for"): this;
}

type IStores<T> = {
  [K in IStringKeyOf<T>]: Store<T, T[K]>;
};

export class State<T> extends EventEmitter {
  public Record: ImmutableRecord.Factory<T>;
  public current: RecordOf<T>;
  public StoresRecord: ImmutableRecord.Factory<IStores<T>>;
  public stores: RecordOf<IStores<T>>;

  constructor(
    initialState: T,
    fromJSONs: Record<IStringKeyOf<T>, IFromJSON<T[IStringKeyOf<T>]>>
  ) {
    super();

    this.Record = ImmutableRecord(initialState);
    this.current = this.Record();
    this.StoresRecord = ImmutableRecord(
      this.current.toSeq().reduce((initialStores, _, key) => {
        const name = key as IStringKeyOf<T>,
          fromJSON = fromJSONs[name] as IFromJSON<T[IStringKeyOf<T>]>;

        if (typeof fromJSON === "function") {
          initialStores[name] = new Store(this, name, fromJSON);
        } else {
          throw new Error(`fromJSON function is required for store ${name}`);
        }

        return initialStores;
      }, {} as IStores<T>)
    );
    this.stores = this.StoresRecord();
  }

  getCurrent() {
    return this.current;
  }

  getStore<K extends IStringKeyOf<T>>(name: K): Store<T, T[K]> {
    return this.stores.get(name);
  }

  clear() {
    this.stores = this.StoresRecord();
    this.set(this.Record());
    return this;
  }

  set(newState: RecordOf<T>, action?: string) {
    if (newState !== this.current) {
      this.current = newState;
      this.emit("change", this.current, action);
    }
    return this;
  }
  setFor(name: IStringKeyOf<T>, newState: T[IStringKeyOf<T>], action?: string) {
    this.set(
      this.current.set(name, newState),
      action ? `${name}.${action}` : name
    );
    this.emit("change-for", this.current, name, action);
    return this;
  }
  update(updateFn: (state: RecordOf<T>) => RecordOf<T>, action?: string) {
    return this.set(updateFn(this.current), action);
  }
  updateFor(
    name: IStringKeyOf<T>,
    updateFn: (state: T[IStringKeyOf<T>]) => T[IStringKeyOf<T>],
    action?: string
  ) {
    return this.setFor(
      name,
      updateFn(this.current.get(name) as T[IStringKeyOf<T>]),
      action
    );
  }

  toJS(): IJSONObject {
    return this.current.toJS();
  }
  toJSON(): T {
    return this.current.toJSON();
  }
  fromJSON(json: IJSONObject) {
    this.set(
      this.stores
        .toSeq()
        .reduce(
          (current, store, key) =>
            current.set(
              key,
              store.fromJSON(json[key as string] as IJSONObject)
            ),
          this.Record()
        ),
      "fromJSON"
    );
    return this;
  }
}
