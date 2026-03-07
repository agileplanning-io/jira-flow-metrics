type AnyFn<S> = (state: S, params: any) => S;
type Params<S, H extends AnyFn<S>> = H extends (state: S, params: infer P) => S
  ? P
  : never;

// type Handlers<S> = H extends Record<string, AnyFn<S>>;

export function createReducer<S>() {
  return <H extends Record<string, AnyFn<S>>>(handlers: H) => {
    type Action = {
      [K in keyof H & string]: { type: K } & Params<S, H[K]>;
    }[keyof H & string];
    return {
      reducer: (state: S, action: Action): S =>
        (handlers[action.type as keyof H] as AnyFn<S>)(state, action as any),
      actions: Object.fromEntries(
        Object.keys(handlers).map((key) => [
          key,
          (params: object) => ({ type: key, ...params }),
        ]),
      ) as unknown as {
        [K in keyof H & string]: (
          params: Params<S, H[K]>,
        ) => { type: K } & Params<S, H[K]>;
      },
    };
  };
}
