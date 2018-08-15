import EventEmitter = require("events");
import { State } from "./State";
import { IState } from "./IState";

export class Store<S = IState, SS = IState> extends EventEmitter {
    private _state: State<S>;
    private _name: string;

    constructor(state: State<S>, name: string) {
        super();

        this._state = state;
        this._name = name;
    }

    getName(): string {
        return this._name;
    }

    getState(): SS {
        return this._state.getStateFor(this._name);
    }

    setState(state: SS): Store<S, SS> {
        this.emit("set-state", state);
        this._state.setStateFor(this._name, state);
        return this;
    }

    updateState(fn: (prev: SS) => SS): Store<S, SS> {
        return this.setState(fn(this.getState()));
    }

    noEmitSetState(state: SS): Store<S, SS> {
        this._state.noEmitSetStateFor(this._name, state);
        return this;
    }

    noEmitUpdateState(fn: (prev: SS) => SS): Store<S, SS> {
        return this.noEmitSetState(fn(this.getState()));
    }
}
