import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { actions, AppState, ContentRef } from "@nteract/core";
import { Source } from "@nteract/presentational-components";

import Editor from "../inputs/editor";

interface NamedRawCellSlots {
  editor?: React.ReactChild;
}

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  cell: Immutable.Map<string, any>;
  cell_type: "raw";
  children?: NamedRawCellSlots;
}

interface DispatchProps {
  focusAboveCell: () => void;
  focusBelowCell: () => void;
}

export class PureRawCell extends React.Component<
  ComponentProps & DispatchProps
> {
  render() {
    const { id, contentRef, children } = this.props;

    let editor;
    if (children) {
      editor = children.editor;
    }

    return (
      <Source className="nteract-cell-source">
        <Editor id={id} contentRef={contentRef} className="nteract-cell-editor">
          {editor ? (
            <React.Fragment>{editor}</React.Fragment>
          ) : (
            <CodeMirrorEditor />
          )}
        </Editor>
      </Source>
    );
  }
}

export const makeMapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ComponentProps
): ((dispatch: Dispatch) => DispatchProps) => {
  const mapDispatchToProps = (dispatch: Dispatch) => {
    const { id, contentRef } = ownProps;
    return {
      focusAboveCell: () => {
        dispatch(actions.focusPreviousCell({ id, contentRef }));
        dispatch(actions.focusPreviousCellEditor({ id, contentRef }));
      },
      focusBelowCell: () => {
        dispatch(
          actions.focusNextCell({ id, createCellIfUndefined: true, contentRef })
        );
        dispatch(actions.focusNextCellEditor({ id, contentRef }));
      }
    };
  };
  return mapDispatchToProps;
};

const RawCell = connect<void, DispatchProps, ComponentProps, AppState>(
  null,
  makeMapDispatchToProps
)(PureRawCell);

RawCell.defaultProps = {
  cell_type: "raw"
};

export default RawCell;
