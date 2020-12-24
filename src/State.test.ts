import * as tape from "tape";
import { Record, RecordOf, List } from "immutable";
import { State, IStateTypeOf } from ".";
import { IJSONObject } from "@aicacia/json";

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

function TodoListFromJSON(json: IJSONObject): RecordOf<ITodoList> {
  return TodoList({
    list: List<RecordOf<ITodo>>((json.list as Array<IJSONObject>).map(Todo)),
  });
}

const state = new State(
  {
    [TODO_LIST_NAME]: TodoList(),
  },
  {
    [TODO_LIST_NAME]: TodoListFromJSON,
  }
);

type IState = IStateTypeOf<typeof state>;

const createId = (() => {
  let id = 0;
  return () => ++id;
})();

const todoList = state.getStore(TODO_LIST_NAME);

const createTodo = (text: string) => {
  const id = createId();
  todoList.update(
    (state) => state.update("list", (list) => list.push(Todo({ id, text }))),
    "create"
  );
  return id;
};

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

tape("events (immutable)", (assert: tape.Test) => {
  let stateChangeCalled = 0,
    todoListChangeCalled = 0;

  const onStateChange = (_newState: IState, name: string, action?: string) => {
      stateChangeCalled++;
      assert.deepEqual(name, TODO_LIST_NAME);
      assert.true(typeof action === "string");
    },
    onStoreChange = () => todoListChangeCalled++;

  state.on("change", onStateChange);
  todoList.on("change", onStoreChange);

  const id = createTodo("Hello, world!");
  removeTodoById(id);

  assert.equal(stateChangeCalled, 2);
  assert.equal(todoListChangeCalled, 2);

  // clean up
  state.clear();
  state.off("change", onStateChange);
  todoList.off("change", onStoreChange);

  assert.end();
});

tape("set, update (immutable)", (assert: tape.Test) => {
  assert.equal(todoList.getCurrent().list.size, 0);

  createTodo("Hello, world!");
  const todo = todoList.getCurrent().list.get(0) as RecordOf<ITodo>;
  assert.equal(todo.text, "Hello, world!");

  removeTodoById(todo.id);
  assert.equal(todoList.getCurrent().list.size, 0);

  // clean up
  state.clear();

  assert.end();
});

tape("to/from JSON (immutable)", (assert: tape.Test) => {
  createTodo("Hello, world!");

  const json = JSON.parse(JSON.stringify(state));

  state.clear();
  assert.equal(todoList.getCurrent().list.size, 0);

  state.fromJSON(json);

  const todo = todoList.getCurrent().list.get(0) as RecordOf<ITodo>;
  assert.equal(todo.text, "Hello, world!");

  // clean up
  state.clear();

  assert.end();
});

interface ITodoListMut {
  list: ITodo[];
}

const todoListInitalState: ITodoListMut = {
  list: [],
};

function TodoListMutFromJSON(json: IJSONObject): ITodoListMut {
  return {
    list: (json.list as Array<IJSONObject>).map((json) => ({
      id: json.id as number,
      text: json.text as string,
    })),
  };
}

const stateMut = new State(
  {
    [TODO_LIST_NAME]: todoListInitalState,
  },
  {
    [TODO_LIST_NAME]: TodoListMutFromJSON,
  }
);

const todoListMut = stateMut.getStore(TODO_LIST_NAME);

const createTodoMut = (text: string) => {
  const id = createId();
  todoListMut.update(
    (state) => ({
      ...state,
      list: [...state.list, { id, text }],
    }),
    "create"
  );
  return id;
};

const removeTodoByIdMut = (id: number) =>
  todoListMut.update((state) => {
    const index = state.list.findIndex((todo) => todo.id === id);

    if (index === -1) {
      return state;
    } else {
      const newList = state.list.slice();
      newList.splice(index, 1);
      return { ...state, list: newList };
    }
  }, "remove");

tape("set, update", (assert: tape.Test) => {
  assert.equal(todoListMut.getCurrent().list.length, 0);

  createTodoMut("Hello, world!");
  const todo = todoListMut.getCurrent().list[0] as ITodo;
  assert.equal(todo.text, "Hello, world!");

  removeTodoByIdMut(todo.id);
  assert.equal(todoListMut.getCurrent().list.length, 0);

  // clean up
  stateMut.clear();

  assert.end();
});
