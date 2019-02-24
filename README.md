# ts-state

state management for applications

## States

a State is the single source of truth for applications, states have stores which are views in to your state that are used to update the state.

## Stores

stores are views into your state, they can trigger updates by setState or updateState

### Example Store

```typescript
import { State } from "@aicacia/state";

const TODOS_INITIAL_STATE = {
    list: []
};

const GLOBAL_INITIAL_STATE = {
    todos: TODOS_INITIAL_STATE
};

const state = new State(GLOBAL_INITIAL_STATE);

let TODO_ID = 0;

export interface ITodos {
    list: [];
}

export const store = state.getStore("todos");

export const selectTodos = ({ list }: ITodos) => list;

export const create = (text: string) => {
    const id = TODO_ID++;

    store.updateState(({ list }: ITodos) => ({
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
    store.updateState(({ list }: ITodos) => {
        const index = list.findIndex(todo => todo.id === id);

        if (index !== -1) {
            list = state.list.slice();
            list.splice(index, 1);
        }

        return { list };
    });
};
```
