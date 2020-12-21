import type { Record } from "immutable";

export type IExtractRecordOf<T> = T extends Record<infer U> ? U : T;
