import type { Record } from "immutable";

export type ExtractRecordOf<T> = T extends Record<infer U> ? U : T;
