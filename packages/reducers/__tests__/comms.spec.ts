import * as stateModule from "@nteract/types";

import commsReducer from "../src/comms";
import Immutable from "immutable";

describe("registerCommTarget", () => {
  test("sets comm targets", () => {
    const state = stateModule.makeCommsRecord();

    const action = {
      type: "REGISTER_COMM_TARGET",
      name: "steve",
      handler: "?????"
    };

    const nextState = commsReducer(state, action);
    expect(nextState).toEqual(state.setIn(["targets", "steve"], "?????"));
  });
});

describe("comm reducers", () => {
  test("process comm_open and comm_message actions", () => {
    const state = stateModule.makeCommsRecord();
    const action = {
      type: "COMM_OPEN",
      target_module: "reducers",
      target_name: "setIn",
      data: { a: 2 },
      comm_id: 100
    };

    const nextState = commsReducer(state, action);
    expect(nextState.getIn(["info", 100]).toJS()).toEqual({
      target_module: "reducers",
      target_name: "setIn"
    });

    expect(nextState.getIn(["models", 100]).toJS()).toEqual({ a: 2 });

    const actionMessage = {
      type: "COMM_MESSAGE",
      data: { path: ["a"], value: 3 },
      comm_id: 100
    };

    const afterMessageState = commsReducer(nextState, actionMessage);

    expect(afterMessageState.getIn(["models", 100]).toJS()).toEqual({
      a: 3
    });
  });
  test("does a straight replacement for unknown comm messages", () => {
    const state = stateModule.makeCommsRecord();

    // Note that we're not starting with a COMM_OPEN in order to process
    // a COMM_MESSAGE that hasn't been "opened"
    const action = {
      type: "COMM_MESSAGE",
      data: { x: 5113, bagels: true },
      comm_id: 101
    };

    const nextState = commsReducer(state, action);

    expect(nextState.getIn(["models", 101]).toJS()).toEqual({
      bagels: true,
      x: 5113
    });
  });
  test("handles update messages for ipywidgets correctly", () => {
    const state = stateModule.makeCommsRecord({
      models: Immutable.Map({
        test: Immutable.Map({
          state: Immutable.Map({
            x: 5112,
            y: "test"
          })
        })
      })
    });

    // Note that we're not starting with a COMM_OPEN in order to process
    // a COMM_MESSAGE that hasn't been "opened"
    const action = {
      type: "COMM_MESSAGE",
      data: { method: "update", state: { x: 5113, bagels: true } },
      comm_id: "test"
    };

    const nextState = commsReducer(state, action);

    expect(nextState.getIn(["models", "test", "state"]).toJS()).toEqual({
      bagels: true,
      x: 5113,
      y: "test"
    });
  });
});
