import * as tape from "tape";
import { State } from "../lib";

tape("State createStore, setState, updateState", (assert: tape.Test) => {
    const state = new State(),
        store = state.createStore("test", { count: 0 } as any);

    let eventSetStateCalled = false,
        eventSetStateForCalled = false;

    state.on("set-state", () => {
        eventSetStateCalled = true;
    });

    state.on("set-state-for", name => {
        eventSetStateForCalled = true;
        assert.equals(
            name,
            "test",
            "updateState(...) should pass the name of the store when it triggers `set-state-for`"
        );
    });

    store.setState({ count: 1 });
    store.updateState(({ count }) => ({ count: count + 1 }));

    assert.deepEquals(
        state.getStateFor("test"),
        { count: 2 },
        "updateState(...) takes the current state and the return value updates a new state"
    );
    assert.deepEquals(
        state.getState(),
        { test: { count: 2 } },
        "updateState(...) updates the entire state tree with the returned value"
    );
    assert.deepEquals(
        store.getState(),
        { count: 2 },
        "updateState(...) should update the state"
    );

    assert.equals(
        eventSetStateCalled,
        true,
        "calling updateState(...) triggers the `set-state` event"
    );
    assert.equals(
        eventSetStateForCalled,
        true,
        "calling updateState(...) triggers the `set-state-for` event"
    );

    assert.end();
});

tape("State removeStore", (assert: tape.Test) => {
    const state = new State();
    let store = state.createStore("test", { count: 0 });

    let eventDeleteStoreCalled = false;

    const reset = () => {
        eventDeleteStoreCalled = false;
    };

    state.on("delete-store", () => {
        eventDeleteStoreCalled = true;
    });

    let deletedStore = state.removeStore("test");

    assert.equals(
        deletedStore.getState(),
        undefined,
        "deleting a store returns the deleted store object and removes the state"
    );

    assert.equals(
        eventDeleteStoreCalled,
        true,
        "deleting a store calls the event `delete-store`"
    );

    reset();

    deletedStore = state.removeStore("test");

    assert.equals(
        deletedStore,
        undefined,
        "deleting a store that doesn't exist returns undefined"
    );

    assert.equals(
        eventDeleteStoreCalled,
        false,
        "deleting a non-existent store does not call the `delete-store` event"
    );

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
            assert.equals(
                name,
                "test",
                "updating a store named `test` triggers an update event containing the store name"
            );
        });

        store.setState({ count: 1 });
        assert.deepEquals(
            store.getState(),
            { count: 1 },
            "calling set state replaces old state with a new state"
        );

        assert.equals(
            eventSetStateCalled,
            true,
            "ensure that the set-state event is called on store.setState(...)"
        );
        assert.equals(
            eventSetStateForCalled,
            true,
            "ensure that the set-state-for event is called on store.setState(...)"
        );

        reset();

        store.noEmitSetState({ count: 0 });
        assert.deepEquals(
            store.getState(),
            { count: 0 },
            "setting state without emitters should still update state"
        );

        assert.equals(
            eventSetStateCalled,
            false,
            "calling noEmitSetState(...) should not emit the event `set-state`"
        );
        assert.equals(
            eventSetStateForCalled,
            false,
            "calling noEmitSetState(...) should not emit the event `set-state-for`"
        );

        assert.end();
    }
);

tape("State/Store toJSON fromJSON", (assert: tape.Test) => {
    const state = new State(),
        store = state.createStore("test", { count: 0 });

    assert.deepEquals(
        store.toJSON(),
        { count: 0 },
        "store.toJSON() should convert store contents to a JSON object"
    );
    store.setStateJSON({ count: 2 });
    assert.deepEquals(
        store.toJSON(),
        { count: 2 },
        "store.setStateJSON() should set the state given a JSON object"
    );

    state.setStateJSON({
        test: { count: 1 }
    });
    assert.deepEquals(
        state.toJSON(),
        {
            test: { count: 1 }
        },
        "store.setStateJSON() should set the state given a JSON object on multiple calls"
    );

    assert.end();
});
