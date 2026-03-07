import { createImmerReducer } from "./create-reducer";

describe("#createReducer", () => {
  type State = {
    count: number;
  };

  const reducers = {
    reset: (state: State) => (state.count = 0),
    inc: (state: State, { by }: { by?: number }) => (state.count += by ?? 1),
  };

  const { reducer, actions } = createImmerReducer(reducers);

  const initialState = () => ({ count: 0 });

  it("returns a reducer over the given actions", () => {
    const state1 = reducer(initialState(), actions.inc({}));
    expect(state1).toEqual({ count: 1 });

    const state2 = reducer(state1, actions.inc({}));
    expect(state2).toEqual({ count: 2 });

    const state3 = reducer(state2, actions.inc({ by: 2 }));
    expect(state3).toEqual({ count: 4 });

    const state4 = reducer(state3, actions.reset({}));
    expect(state4).toEqual({ count: 0 });
  });
});
