# ts-state

[![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue")](LICENSE-MIT)
[![docs](https://img.shields.io/badge/docs-typescript-blue.svg)](https://aicacia.gitlab.io/libs/ts-state/)
[![npm (scoped)](https://img.shields.io/npm/v/@aicacia/state)](https://www.npmjs.com/package/@aicacia/state)
[![pipelines](https://gitlab.com/aicacia/libs/ts-state/badges/master/pipeline.svg)](https://gitlab.com/aicacia/libs/ts-state/-/pipelines)

state management for applications

## Introduction to State

This library handles state a little differently than you might be accustomed to in your day-to-day frontend development, especially if you do a lot of coding with Redux. To some extent we like Redux, at least we like the features it offers such as having an immutable application state and allowing for a way to walk through and replay changes in your application. However, for our purposes it is too verbose and makes the developer think about things that they should not care about. The developer should only worry about his application such as building a login form or a sign in page and not about how to manage a full update cycle of application states and dispatch events for various components.

### Library Design Goals

What we have tried to achieve with this library is the following architectural design goals.

1. Provide all the features of Redux.
2. Reduce the amount of code required to manage state in frontend applications.
3. Reduce the amount of cognitive overhead required.
4. Make building your applications less about state and more about the features of the application.

## State and Views

a State is the single source of truth for applications, states can have views which are slices into your state that are used to update the main state.

### Example Store

```typescript
const TODO_LIST_NAME = "todo_list";

interface ITodo {
  id: number;
  text: string;
}

const Todo = Record<ITodo>({
  id: 0,
  text: "",
});

interface ITodoList {
  list: List<ITodo>;
}

const TodoList = Record<ITodoList>({
  list: List(),
});

const AppState = Record({
  [TODO_LIST_NAME]: TodoList(),
});

const state = new State(AppState());

const createId = (() => {
  let id = 0;
  return () => ++id;
})();

const todoList = state.getView(TODO_LIST_NAME);

const createTodo = (text: string) =>
  todoList.update((state) =>
    state.update("list", (list) => list.push(Todo({ id: createId(), text })))
  );

const removeTodoById = (id: number) =>
  todoList.update((state) =>
    state.update("list", (list) => {
      const index = list.findIndex((todo) => todo.id === id);

      if (index === -1) {
        return list;
      } else {
        return list.remove(index);
      }
    })
  );
```
