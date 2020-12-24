import { State } from "./State";

export function initReduxDevTools<T>(state: State<T>) {
  if ((global as any).__REDUX_DEVTOOLS_EXTENSION__) {
    const devTools = (global as any).__REDUX_DEVTOOLS_EXTENSION__.connect();

    devTools.subscribe((message: any) => {
      if (
        message.type === "DISPATCH" &&
        message.payload.type === "JUMP_TO_ACTION"
      ) {
        state.fromJSON(JSON.parse(message.state));
      }
    });

    state.on("change-for", (newState, name, action) => {
      if (action) {
        name = `${name}.${action}`;
      }
      devTools.send(
        {
          type: name,
          payload: newState,
        },
        newState
      );
    });
  }
}
