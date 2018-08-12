import EventEmitter = require("events");
import { State } from "./State";

export class Store extends EventEmitter {
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

    getState(): string {
        return this._state.getStateFor(this._name);
    }

    setState(state: any): Store {
        this._state.setStateFor(this._name, state);
        return this;
    }

    updateState(fn: (prev: any) => any) {
        return this.setState(fn(this.getState()));
    }

    unsafeSetState(state: any): Store {
        this._state.unsafeSetStateFor(this._name, state);
        return this;
    }

    unsafeUpdateState(fn: (prev: any) => any) {
        return this.unsafeSetState(fn(this.getState()));
    }
}
