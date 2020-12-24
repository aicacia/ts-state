import { State } from "./State";

export type IStateTypeOf<S extends State<any>> = S["current"];
