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

tape(
    "State no emit createStore, setState, updateState",
    (assert: tape.Test) => {
        const state = new State(),
            store = state.createStore("test", { count: 0 });

        let eventSetStateCalled = false,
            eventSetStateForCalled = false;

        const reset = () => {
            eventSetStateCalled = false;
            eventSetStateForCalled = false;
        };

        state.on("set-state", () => {
            eventSetStateCalled = true;
        });

        state.on("set-state-for", name => {
            eventSetStateForCalled = true;
            assert.equals(name, "test");
        });

        store.setState({ count: 1 });
        assert.deepEquals(store.getState(), { count: 1 });

        assert.equals(eventSetStateCalled, true);
        assert.equals(eventSetStateForCalled, true);

        reset();

        store.noEmitSetState({ count: 0 });
        assert.deepEquals(store.getState(), { count: 0 });

        assert.equals(eventSetStateCalled, false);
        assert.equals(eventSetStateForCalled, false);

        assert.end();
    }
);

tape("State/Store toJSON fromJSON", (assert: tape.Test) => {
    const state = new State(),
        store = state.createStore("test", { count: 0 });

    assert.deepEquals(store.toJSON(), { count: 0 });
    store.setStateJSON({ count: 2 });
    assert.deepEquals(store.toJSON(), { count: 2 });

    state.setStateJSON({
        test: { count: 1 }
    });
    assert.deepEquals(state.toJSON(), {
        test: { count: 1 }
    });

    assert.end();
});
