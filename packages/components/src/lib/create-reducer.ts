import { produce, Draft } from "immer";

type AnyFn = (...args: any[]) => any;

type StateFromHandlers<H> = H[keyof H] extends (
  state: infer S,
  ...args: any[]
) => any
  ? S
  : never;

type Payload<F extends AnyFn> = Parameters<F> extends [any, infer P] ? P : void;

type HasPayload<F extends AnyFn> = Parameters<F> extends [any, any]
  ? true
  : false;

type ActionFromHandlers<H extends Record<string, AnyFn>> = {
  [K in keyof H & string]: HasPayload<H[K]> extends true
    ? { type: K; payload: Payload<H[K]> }
    : { type: K };
}[keyof H & string];

type ActionCreators<H extends Record<string, AnyFn>> = {
  [K in keyof H & string]: HasPayload<H[K]> extends true
    ? (payload: Payload<H[K]>) => { type: K; payload: Payload<H[K]> }
    : () => { type: K };
};

export function createImmerReducer<
  H extends Record<string, (state: any, payload?: any) => void>,
>(handlers: H) {
  type S = StateFromHandlers<H>;
  type Action = ActionFromHandlers<H>;

  const reducer = (state: S, action: Action): S =>
    produce(state, (draft) => {
      const handler = handlers[action.type as keyof H] as (
        state: Draft<S>,
        payload?: any,
      ) => void;

      if ("payload" in action) {
        handler(draft, action.payload);
      } else {
        handler(draft);
      }
    });

  const actions = Object.fromEntries(
    Object.keys(handlers).map((key) => [
      key,
      (payload?: unknown) =>
        payload === undefined ? { type: key } : { type: key, payload },
    ]),
  ) as ActionCreators<H>;

  return { reducer, actions };
}
