import { AppState, ContentRef } from "@nteract/types";
import { model } from "./index";
import { cellById } from "./notebook";

export interface CellAddress {
  id: string;
  contentRef: ContentRef;
}

export const cellAddress = ({ id, contentRef }: CellAddress) => (
  { id, contentRef }
);

export const cellFromState = (
  state: AppState,
  { id, contentRef }: CellAddress,
) => {
  const notebook = model(state, { contentRef });
  if (!notebook || notebook.type !== "notebook") {
    throw new Error("non-notebook model");
  }

  const cell = cellById(notebook, { id });
  if (!cell) {
    throw new Error("cell not found inside cell map");
  }

  return cell;
};
