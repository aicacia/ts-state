# ts-state

state management for applications

## Introduction to State

This library handles state a little differently than you might be accustomed to in your day-to-day frontend development, especially if you do a lot of coding with Redux. To some extent we like Redux, at least we like the features it offers such as having an immutable application state and allowing for a way to walk through and replay changes in your application. However, for our purposes it is too verbose and makes the developer think about things that they should not care about. The developer should only worry about his application such as building a login form or a sign in page and not about how to manage a full update cycle of application states and dispatch events for various components.

### Library Design Goals

What we have tried to achieve with this library is the following architectural design goals.

1. Provide all the features of Redux.
2. Reduce the amount of code required to manage state in frontend applications.
3. Reduce the amount of cognitive overhead required.
4. Make building your applications less about state and more about the features of the application.

## States

a State is the single source of truth for applications, states have stores which are views in to your state that are used to update the state.

## Stores

stores are views into your state, they can trigger updates by setState or updateState

### Example Store

```typescript
import { State } from "@stembord/state";

const TODOS_STORE_NAME = "todos";
const TODOS_INITIAL_STATE = {
  list: []
};

const APP_INITIAL_STATE = {
  [TODOS_STORE_NAME]: TODOS_INITIAL_STATE
};

const state = new State(APP_INITIAL_STATE);
type IState = typeof state.getState();

let TODO_ID = 0;

export interface ITodos {
  list: [];
}

export const store = state.getStore(TODOS_STORE_NAME);

export const selectTodos = (state: IState) => state.get(TODOS_STORE_NAME).list;

export const create = (text: string) => {
  const id = TODO_ID++;

  store.updateState((state) => ({
    ...state,
    list: [
      ...state.list,
      {
        id: id,
        text: text
      }
    ]
  }));
};

export const remove = (id: number) => {
  store.updateState((state) => {
    const index = state.list.findIndex(todo => todo.id === id);

    if (index !== -1) {
      const newList = state.list.slice();
      newList.splice(index, 1);
      return { ...state, list: newList };
    } else {
      return state;
    }
  });
};
```
