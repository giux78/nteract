import React from "react";

import Cells from "./cells/cells";

export default class Notebook extends React.Component {
  render() {
    return <Cells contentRef={this.props.contentRef} />;
  }
}
