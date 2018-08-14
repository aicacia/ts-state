import EventEmitter = require("events");
import { State } from "./State";

export class Store<T = any> extends EventEmitter {
    private _state: State;
    private _name: string;

    constructor(state: State, name: string) {
        super();

        this._state = state;
        this._name = name;
    }

    getName(): string {
        return this._name;
    }

    getState(): T {
        return this._state.getStateFor(this._name);
    }

    setState(state: T): Store<T> {
        this.emit("set-state", state);
        this._state.setStateFor(this._name, state);
        return this;
    }

    updateState(fn: (prev: T) => T) {
        return this.setState(fn(this.getState()));
    }

    unsafeSetState(state: T): Store<T> {
        this.emit("unsafe-set-state", state);
        this._state.unsafeSetStateFor(this._name, state);
        return this;
    }

    unsafeUpdateState(fn: (prev: T) => T) {
        return this.unsafeSetState(fn(this.getState()));
    }
}
