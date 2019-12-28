import { actions } from "@nteract/core";
import { cell } from "@nteract/selectors";
import { AppState } from "@nteract/types";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import styled from "styled-components";

import UndoableDelete from "./undoable-delete";

interface InitialProps extends cell.CellAddress {
  secondsDelay: number;
  children: React.ReactNode;
}

interface InnerProps extends InitialProps {
  className?: string;
  isDeleting: boolean;
  doDelete: () => void;
  doUndo: () => void;
}

const BareUndoableCellDelete = (props: InnerProps) =>
  <div className={props.className}>
    <UndoableDelete
      secondsDelay={props.secondsDelay}
      message="This cell has been deleted."
      isDeleting={props.isDeleting}
      doDelete={props.doDelete}
      doUndo={props.doUndo}
    >
      {props.children}
    </UndoableDelete>
  </div>;
BareUndoableCellDelete.displayName = "BareUndoableCellDelete";

const UnstyledUndoableCellDelete = connect(
  (state: AppState, props: InitialProps) => ({
    isDeleting: !!cell.cellFromState(state, cell.cellAddress(props))
      .getIn(["metadata", "nteract", "transient", "deleting"]),
  }),
  (dispatch: Dispatch, props: InitialProps) => ({
    doDelete:
      () => dispatch(actions.deleteCell(cell.cellAddress(props))),
    doUndo:
      () => dispatch(actions.unmarkCellAsDeleting(cell.cellAddress(props))),
  })
)(BareUndoableCellDelete);
UnstyledUndoableCellDelete.displayName = "UnstyledUndoableCellDelete";

const UndoableCellDelete = styled(UnstyledUndoableCellDelete)`
  & > .undo-deletion {
    background-color: var(--theme-cell-input-bg);
    color: var(--theme-cell-input-fg);
    padding: 1rem 10rem 1rem 1rem;
    
    & > button {
      position: absolute;
      right: 1.25rem;
      z-index: 1;
    }
  }
`;
UndoableCellDelete.displayName = "UndoableCellDelete";

export default UndoableCellDelete;
export { UndoableCellDelete, UnstyledUndoableCellDelete };
