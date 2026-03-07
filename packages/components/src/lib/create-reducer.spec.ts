import { createReducer } from "./create-reducer";

describe("#createReducer", () => {
  type State = {
    count: number;
  };

  const { reducer, actions } = createReducer({
    reset: (state: State) => (state.count = 0),
    inc: (state: State) => (state.count += 1),
    incBy: (state: State, payload: { amount: number }) =>
      (state.count += payload.amount),
  });

  const initialState = () => ({ count: 0 });

  it("returns a reducer over the given actions", () => {
    const state1 = reducer(initialState(), actions.inc());
    expect(state1).toEqual({ count: 1 });

    const state2 = reducer(state1, actions.inc());
    expect(state2).toEqual({ count: 2 });

    const state3 = reducer(state2, actions.incBy({ amount: 2 }));
    expect(state3).toEqual({ count: 4 });

    const state4 = reducer(state3, actions.reset());
    expect(state4).toEqual({ count: 0 });
  });
});
