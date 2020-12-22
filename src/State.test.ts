import * as tape from "tape";
import { Record, RecordOf, List } from "immutable";
import { State } from "./State";

tape("State createStore, setState, updateState", (assert: tape.Test) => {
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
    todoList.update(
      (state) =>
        state.update("list", (list) =>
          list.push(Todo({ id: createId(), text }))
        ),
      "create"
    );

  const removeTodoById = (id: number) =>
    todoList.update(
      (state) =>
        state.update("list", (list) => {
          const index = list.findIndex((todo) => todo.id === id);

          if (index === -1) {
            return list;
          } else {
            return list.remove(index);
          }
        }),
      "remove"
    );

  let stateChangeCalled = 0;
  let todoListChangeCalled = 0;

  state.on("change", (_newState, path, action) => {
    stateChangeCalled++;
    assert.deepEqual(path, [TODO_LIST_NAME]);
    assert.true(typeof action === "string");
  });
  todoList.on("change", () => {
    todoListChangeCalled++;
  });

  assert.equal(todoList.getCurrent().list.size, 0);

  createTodo("Hello, world!");
  const todo = todoList.getCurrent().list.get(0) as RecordOf<ITodo>;
  assert.equal(todo.text, "Hello, world!");

  removeTodoById(todo.id);
  assert.equal(todoList.getCurrent().list.size, 0);

  assert.equal(stateChangeCalled, 2);
  assert.equal(todoListChangeCalled, 2);

  assert.end();
});
