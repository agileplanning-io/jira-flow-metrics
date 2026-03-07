import { Draft, produce } from "immer";

// Helper to extract the payload type from a handler
type Params<S, F> = F extends (state: Draft<S>, action: infer P) => any
  ? P
  : never;

// Handlers receive Draft<S> to allow mutation
type Handler<S, P = any> = (state: Draft<S>, action: P) => void;

export function createImmerReducer<H extends Record<string, Handler<any, any>>>(
  handlers: H,
) {
  // Infer the state type from the handlers
  type S = H[keyof H] extends Handler<infer State, any> ? State : never;

  // Create a discriminated union of all actions
  type Action = {
    [K in keyof H & string]: { type: K } & Params<S, H[K]>;
  }[keyof H & string];

  // Reducer: applies the action using Immer produce
  const reducer = (state: S, action: Action): S =>
    produce(state, (draft: Draft<S>) => {
      const handler = handlers[action.type as keyof H] as Handler<S, any>;
      handler(draft, action);
    });

  // Fully typed actions object
  const actions = Object.fromEntries(
    Object.keys(handlers).map((key) => [
      key,
      (params: object) => ({ type: key, ...params }),
    ]),
  ) as unknown as {
    [K in keyof H & string]: (
      params: Params<S, H[K]>,
    ) => { type: K } & Params<S, H[K]>;
  };

  return { reducer, actions };
}
