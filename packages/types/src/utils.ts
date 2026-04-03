// TODO: migrate all utils in ./utils dir here.

export type Expand<T> = {
  [K in keyof T]: T[K];
} & {};
