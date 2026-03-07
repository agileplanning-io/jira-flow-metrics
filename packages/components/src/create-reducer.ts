// type AnyFn<S> = (state: S, params: any) => S;
// type Params<S, H extends AnyFn<S>> = H extends (state: S, params: infer P) => S
//   ? P
//   : never;

import { Draft, produce } from "immer";

// // type Handlers<S> = H extends Record<string, AnyFn<S>>;

// type HandlersFromObject<S, T extends Record<string, AnyFn<S>>> = T;

// // type StateFromHandlers<S, T

// export function createReducer<S, H extends Record<string, AnyFn<S>>>(
//   handlers: H,
// ) {
//   type Action = {
//     [K in keyof H & string]: { type: K } & Params<S, H[K]>;
//   }[keyof H & string];
//   return {
//     reducer: (state: S, action: Action): S =>
//       (handlers[action.type as keyof H] as AnyFn<S>)(state, action as any),
//     actions: Object.fromEntries(
//       Object.keys(handlers).map((key) => [
//         key,
//         (params: object) => ({ type: key, ...params }),
//       ]),
//     ) as unknown as {
//       [K in keyof H & string]: (
//         params: Params<S, H[K]>,
//       ) => { type: K } & Params<S, H[K]>;
//     },
//   };
// }

// type AnyFn<S, P = any> = (state: S, action: P) => S;

// // Extract the action payload from a handler
// type Params<S, F> = F extends (state: S, action: infer P) => any ? P : never;

// export function createReducer<H extends Record<string, AnyFn<any, any>>>(
//   handlers: H,
// ) {
//   // Infer the state type from the handlers
//   type S = H[keyof H] extends (state: infer State, action: any) => any
//     ? State
//     : never;

//   // Create a discriminated union of all actions
//   type Action = {
//     [K in keyof H & string]: { type: K } & Params<S, H[K]>;
//   }[keyof H & string];

//   // The reducer function
//   const reducer = (state: S, action: Action): S => {
//     const handler = handlers[action.type as keyof H] as AnyFn<S, any>;
//     return handler(state, action as any);
//   };

//   // The actions object, fully typed
//   const actions = Object.fromEntries(
//     Object.keys(handlers).map((key) => [
//       key,
//       (params: object) => ({ type: key, ...params }),
//     ]),
//   ) as unknown as {
//     [K in keyof H & string]: (
//       params: Params<S, H[K]>,
//     ) => { type: K } & Params<S, H[K]>;
//   };

//   return { reducer, actions };
// }

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
