import { createImmerReducer } from "./create-reducer";

describe("#createReducer", () => {
  type State = {
    count: number;
  };

  const { reducer, actions } = createImmerReducer({
    reset: (state: State, _: void) => (state.count = 0),
    inc: (state: State, _: void) => (state.count += 1),
  });

  const initialState = () => ({ count: 0 });

  it("returns a reducer over the given actions", () => {
    const newState = reducer(initialState(), actions.inc());
    expect(newState).toEqual({ count: 1 });
    expect(reducer(newState, actions.reset())).toEqual({ count: 0 });
  });
});
