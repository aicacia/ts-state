import { State } from "./State";

export type IStateTypeOf<S extends State<any>> = ReturnType<S["getCurrent"]>;
