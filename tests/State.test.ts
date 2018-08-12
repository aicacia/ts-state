import * as tape from "tape";
import { State } from "../lib";

tape("State createStore, setState, updateState", (assert: tape.Test) => {
    const state = new State(),
        store = state.createStore("test", { count: 0 });

    let eventSetStateCalled = false,
        eventSetStateForCalled = false;

    state.on("set-state", () => {
        eventSetStateCalled = true;
    });

    state.on("set-state-for", name => {
        eventSetStateForCalled = true;
        assert.equals(name, "test");
    });

    store.setState({ count: 1 });
    store.updateState(({ count }) => ({ count: count + 1 }));

    assert.deepEquals(state.getStateFor("test"), { count: 2 });
    assert.deepEquals(state.getState(), { test: { count: 2 } });
    assert.deepEquals(store.getState(), { count: 2 });

    assert.equals(eventSetStateCalled, true);
    assert.equals(eventSetStateForCalled, true);

    assert.end();
});

tape("State unsafe", (assert: tape.Test) => {
    const state = new State(),
        store = state.createStore("test", { count: 0 });

    let eventSetStateCalled = false,
        eventSetStateForCalled = false,
        eventUnsafeSetStateCalled = false,
        eventUnsafeSetStateForCalled = false;

    const reset = () => {
        eventSetStateCalled = false;
        eventSetStateForCalled = false;
        eventUnsafeSetStateCalled = false;
        eventUnsafeSetStateForCalled = false;
    };

    state.on("set-state", () => {
        eventSetStateCalled = true;
    });

    state.on("set-state-for", name => {
        eventSetStateForCalled = true;
        assert.equals(name, "test");
    });

    state.on("unsafe-set-state", () => {
        eventUnsafeSetStateCalled = true;
    });

    state.on("unsafe-set-state-for", name => {
        eventUnsafeSetStateForCalled = true;
        assert.equals(name, "test");
    });

    store.setState({ count: 1 });
    assert.deepEquals(store.getState(), { count: 1 });

    assert.equals(eventSetStateCalled, true);
    assert.equals(eventSetStateForCalled, true);

    assert.equals(eventUnsafeSetStateCalled, false);
    assert.equals(eventUnsafeSetStateForCalled, false);

    reset();

    store.unsafeSetState({ count: 0 });
    assert.deepEquals(store.getState(), { count: 0 });

    assert.equals(eventSetStateCalled, false);
    assert.equals(eventSetStateForCalled, false);

    assert.equals(eventUnsafeSetStateCalled, true);
    assert.equals(eventUnsafeSetStateForCalled, true);

    assert.end();
});
