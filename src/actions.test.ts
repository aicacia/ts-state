import * as tape from "tape";
import { Record, RecordOf, List } from "immutable";
import { State } from ".";
import { IJSONObject } from "@aicacia/json";
import {
  createActionWithPayload,
  createDispatcher,
  IAction,
  mergeReducers,
  mergeMiddleware,
} from "./actions";
import { IStateTypeOf } from "./IStateTypeOf";

const TODO_LIST_NAME = "todoList";

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

const todoCreateAction = createActionWithPayload<string>("TODO_CREATE");
const todoDeleteAction = createActionWithPayload<number>("TODO_DELETE");

const createId = (() => {
  let id = 0;
  return () => ++id;
})();

function todoListReducer(
  state: RecordOf<ITodoList>,
  action: IAction
): RecordOf<ITodoList> {
  if (todoCreateAction.is(action)) {
    return state.update("list", (list) =>
      list.push(Todo({ id: createId(), text: action.payload }))
    );
  } else if (todoDeleteAction.is(action)) {
    return state.update("list", (list) => {
      const index = list.findIndex((todo) => todo.id === action.payload);

      if (index === -1) {
        return list;
      } else {
        return list.remove(index);
      }
    });
  } else {
    return state;
  }
}

const dispatch = createDispatcher(
  state,
  mergeReducers({ [TODO_LIST_NAME]: todoListReducer }),
  mergeMiddleware(
    (_state) => (next) => (action) => {
      console.log(action.type);
      return next(action);
    },
    (state) => (next) => (action) => {
      console.log(state.getCurrent().toJS());
      return next(action);
    }
  )
);
const todoList = state.getStore(TODO_LIST_NAME);

tape("events", (assert: tape.Test) => {
  let stateChangeCalled = 0;

  const onStateChange = (_newState: IState, _action?: string) => {
    stateChangeCalled++;
  };

  state.on("change", onStateChange);

  dispatch(todoCreateAction.create("Hello, world!"));
  const todo = todoList.getCurrent().list.get(0) as RecordOf<ITodo>;
  dispatch(todoDeleteAction.create(todo.id));

  assert.equal(stateChangeCalled, 2);

  // clean up
  state.clear();
  state.off("change", onStateChange);

  assert.end();
});

tape("dispatcher", (assert: tape.Test) => {
  assert.equal(todoList.getCurrent().list.size, 0);

  dispatch(todoCreateAction.create("Hello, world!"));
  const todo = todoList.getCurrent().list.get(0) as RecordOf<ITodo>;
  assert.equal(todo.text, "Hello, world!");

  dispatch(todoDeleteAction.create(todo.id));
  assert.equal(todoList.getCurrent().list.size, 0);

  // clean up
  state.clear();

  assert.end();
});
