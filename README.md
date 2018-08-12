# js-state-immutable

state management for applications

## States

a State is the single source of truth for applications,
states have stores which are used to update the state.

```typescript
createStore(name: string[, initialState: any]): Store
removeStore(name: string)
```

### Example

```typescript
import State from "@nathanfaucett/state";

const state = new State();
const store = state.createStore("counter", {
    count: 0
});

state.on("update", name => {
    console.log("Store " + name + " updated!");
    console.log(state.getState());
});

store.inc = () => {
    store.updateState(({ count }) => ({
        count: count + 1
    }));
};
```

## Stores

stores are views into your state, they trigger updates with these methods

```typescript
setState(state: any)
updateState(fn: (prevState: any) => any)
```

### Example Store with immutable.js

```typescript
import { Map } from "immutable";
import { State } from "@stembord/state";

const state = new State();

let ID = 0;

const todos = state.createStore("todos", fromJS({
    list: []
}));

todos.create = text => {
    const id = ID++;

    todos.updateState(state =>
        state.update("list", list =>
            list.push(Map({
                id: id,
                text: text
            }))
        );
    );
};

todos.remove = id => {
    todos.updateState(state =>
        state.update("list", list =>
            list.remove(list.findIndex((todo) => todo.get("id") === id))
        );
    );
};
```
