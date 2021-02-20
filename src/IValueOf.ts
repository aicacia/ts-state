import { IStringKeyOf } from "./IStringKeyOf";

export type IValueOf<T> = T[IStringKeyOf<T>];
