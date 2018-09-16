import EventEmitter = require("events");
import { State, IState } from "./State";

export class Store<S = IState> extends EventEmitter {
    state: State;
    name: string;

    constructor(state: State, name: string) {
        super();

        this.state = state;
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    getState(): S {
        return this.state.getStateFor(this.name);
    }

    setState(state: S): Store<S> {
        this.emit("set-state", state);
        this.state.setStateFor(this.name, state);
        return this;
    }

    updateState(fn: (prev: S) => S): Store<S> {
        return this.setState(fn(this.getState()));
    }

    noEmitSetState(state: S): Store<S> {
        this.state.noEmitSetStateFor(this.name, state);
        return this;
    }

    noEmitUpdateState(fn: (prev: S) => S): Store<S> {
        return this.noEmitSetState(fn(this.getState()));
    }

    toJSON(): any {
        return this.getState();
    }

    fromJSON(json: any): S {
        return json;
    }

    setStateJSON(json: any): Store<S> {
        return this.setState(this.fromJSON(json));
    }

    noEmitSetStateJSON(json: any): Store<S> {
        return this.noEmitSetState(this.fromJSON(json));
    }
}
