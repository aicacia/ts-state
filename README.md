# ts-state

state management for applications

## States

a State is the single source of truth for applications, states have stores which are views in to your state that are used to update the state.

## Stores

stores are views into your state, they can trigger updates by setState or updateState

### Example Store

```typescript
import { State } from "@stembord/state";

const state = new State();

let ID = 0;

interface ITodos {
    list: [];
}

const todos = state.createStore("todos", {
    list: []
});

export const selectTodos = ({ list }: ITodos) => list;

export const create = (text: string) => {
    const id = ID++;

    todos.updateState(({ list }: ITodos) => ({
        list: [
            ...list,
            {
                id: id,
                text: text
            }
        ]
    }));
};

export const remove = (id: number) => {
    todos.updateState(({ list }: ITodos) => {
        const index = list.findIndex(todo => todo.id === id);

        if (index !== -1) {
            list = state.list.slice();
            list.splice(index, 1);
        }

        return { list };
    });
};
```
