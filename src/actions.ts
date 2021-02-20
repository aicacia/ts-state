import { RecordOf } from "immutable";
import { IStringKeyOf } from "./IStringKeyOf";
import { IValueOf } from "./IValueOf";
import { State } from "./State";

export interface IAction {
  type: string;
}

export interface IActionWithPayload<T> extends IAction {
  payload: T;
}

export function isAction(value: any): value is IAction {
  return (
    value != null && typeof value === "object" && typeof value.type === "string"
  );
}

export function createAction(type: string) {
  function getType() {
    return type;
  }

  function create(): IAction {
    return { type };
  }

  function is(value: any): value is IAction {
    return isAction(value) && value.type === type;
  }

  return { getType, create, is };
}

export function createActionWithPayload<T>(type: string) {
  function getType() {
    return type;
  }

  function create(payload: T): IActionWithPayload<T> {
    return { type, payload };
  }

  function is(value: any): value is IActionWithPayload<T> {
    return isAction(value) && value.type === type;
  }

  return { getType, create, is };
}

export type IReducer<T> = (lastState: T, action: IAction) => T;

export function mergeReducers<T>(
  reducers: Record<IStringKeyOf<T>, IReducer<IValueOf<T>>>
): IReducer<RecordOf<T>> {
  const keys: IStringKeyOf<T>[] = Object.keys(reducers) as any,
    mergedReducers = keys.reduce((mergedReducers, key) => {
      const reducer = reducers[key];
      mergedReducers.push((state, action) =>
        state.update(key, (lastState) => reducer(lastState, action))
      );
      return mergedReducers;
    }, [] as IReducer<RecordOf<T>>[]);

  if (mergedReducers.length) {
    return (state, action) =>
      mergedReducers.reduce((nextReducer, reducer) => (state, action) =>
        nextReducer(reducer(state, action), action)
      )(state, action);
  } else {
    return (state, _action) => state;
  }
}

export type IDispatch = (action: IAction) => void;
export type IMiddleware<T> = (
  state: State<T>
) => (next: IDispatch) => IDispatch;

const defaultMiddleware: IMiddleware<any> = (_state: State<any>) => (next) => (
  action
) => next(action);

export function mergeMiddleware<T>(
  ...middlewares: IMiddleware<T>[]
): IMiddleware<T> {
  return middlewares
    .reverse()
    .reduce((acc, middleware) => (state) => (next) =>
      middleware(state)(acc(state)(next))
    );
}

export function createDispatcher<T>(
  state: State<T>,
  reducer: IReducer<RecordOf<T>>,
  middleware: IMiddleware<T> = defaultMiddleware
): IDispatch {
  function dispatch(action: IAction) {
    state.update((current) => reducer(current, action), action.type);
  }

  return middleware(state)(dispatch);
}
