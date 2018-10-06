import * as tape from "tape";
import { State } from "../lib";

tape("State createStore, setState, updateState", (assert: tape.Test) => {
    const state = new State({ counter: { count: 0 } }),
        counter = state.getStore("counter");

    let eventSetStateCalled = false,
        eventSetStateForCalled = false;

    state.on("set-state", () => {
        eventSetStateCalled = true;
    });

    state.on("set-state-for", name => {
        eventSetStateForCalled = true;
        assert.equals(name, "counter");
    });

    counter.setState({ count: 1 });
    counter.updateState(({ count }) => ({ count: count + 1 }));

    assert.deepEquals(state.getStateFor("counter"), { count: 2 });
    assert.deepEquals(state.getState(), { counter: { count: 2 } });
    assert.deepEquals(counter.getState(), { count: 2 });

    assert.equals(eventSetStateCalled, true);
    assert.equals(eventSetStateForCalled, true);

    assert.end();
});

tape(
    "State no emit createStore, setState, updateState",
    (assert: tape.Test) => {
        const state = new State({ counter: { count: 0 } }),
            counter = state.getStore("counter");

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
            assert.equals(name, "counter");
        });

        counter.setState({ count: 1 });
        assert.deepEquals(counter.getState(), { count: 1 });

        assert.equals(eventSetStateCalled, true);
        assert.equals(eventSetStateForCalled, true);

        reset();

        counter.noEmitSetState({ count: 0 });
        assert.deepEquals(counter.getState(), { count: 0 });

        assert.equals(eventSetStateCalled, false);
        assert.equals(eventSetStateForCalled, false);

        assert.end();
    }
);

tape("State/Store toJSON fromJSON", (assert: tape.Test) => {
    const state = new State({ counter: { count: 0 } }),
        counter = state.getStore("counter");

    assert.deepEquals(counter.toJSON(), { count: 0 });
    counter.setStateJSON({ count: 2 });
    assert.deepEquals(counter.toJSON(), { count: 2 });

    state.setStateJSON({
        counter: { count: 1 }
    });
    assert.deepEquals(state.toJSON(), {
        counter: { count: 1 }
    });

    assert.end();
});
