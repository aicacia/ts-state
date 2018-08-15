export type IState =
    | {
          [key: string]: IState;
      }
    | any;
