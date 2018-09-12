import EventEmitter = require("events");
import { State, IState } from "./State";

export class Store<S = IState> extends EventEmitter {
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

    getState(): S {
        return this._state.getStateFor(this._name);
    }

    setState(state: S): Store<S> {
        this.emit("set-state", state);
        this._state.setStateFor(this._name, state);
        return this;
    }

    updateState(fn: (prev: S) => S): Store<S> {
        return this.setState(fn(this.getState()));
    }

    noEmitSetState(state: S): Store<S> {
        this._state.noEmitSetStateFor(this._name, state);
        return this;
    }

    noEmitUpdateState(fn: (prev: S) => S): Store<S> {
        return this.noEmitSetState(fn(this.getState()));
    }

    toJSON(): any {
        return this.getState();
    }

    fromJSON(json: any): Store<S> {
        this.noEmitSetState(json);
        return this;
    }
}
