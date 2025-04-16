import { Editor, findParentNode } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { Selection, Transaction } from "@tiptap/pm/state";
import { CellSelection, type Rect, TableMap } from "@tiptap/pm/tables";

export function isRectSelected(selection: Selection, rect: Rect): selection is CellSelection {
  if (isCellSelection(selection)) {
    const map = TableMap.get(selection.$anchorCell.node(-1));
    const start = selection.$anchorCell.start(-1);
    const cells = map.cellsInRect(rect);
    const selectedCells = map.cellsInRect(map.rectBetween(
      selection.$anchorCell.pos - start,
      selection.$headCell.pos - start,
    ));
    for (let i = 0, count = cells.length; i < count; i++) {
      if (!selectedCells.includes(cells[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

export function isCellSelection(selection: Selection): selection is CellSelection {
  return selection instanceof CellSelection;
}

export function isColumnSelected(selection: Selection, index: number): selection is CellSelection {
  if (isCellSelection(selection)) {
    const map = TableMap.get(selection.$anchorCell.node(-1));
    return isRectSelected(selection, {
      left: index,
      right: index + 1,
      top: 0,
      bottom: map.height,
    });
  }
  return false;
}

export function isRowSelected(selection: Selection, index: number): selection is CellSelection {
  if (isCellSelection(selection)) {
    const map = TableMap.get(selection.$anchorCell.node(-1));
    return isRectSelected(selection, {
      left: 0,
      right: map.width,
      top: index,
      bottom: index + 1,
    });
  }
  return false;
}

export function isTableSelected(selection: Selection): selection is CellSelection {
  if (isCellSelection(selection)) {
    const map = TableMap.get(selection.$anchorCell.node(-1));
    return isRectSelected(selection, {
      left: 0,
      right: map.width,
      top: 0,
      bottom: map.height,
    });
  }
  return false;
}

export function findTable(selection: Selection) {
  return findParentNode(node => node.type.spec.tableRole && node.type.spec.tableRole === "table")(selection);
}

export function getCellsInColumn(selection: Selection, index: number | number[]) {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    const indexes = Array.isArray(index) ? index : Array.from([index]);
    return indexes.reduce<Array<{ pos: number; start: number; node: Node | null | undefined }>>((acc, index) => {
      if (index >= 0 && index <= map.width - 1) {
        const cells = map.cellsInRect({
          left: index,
          right: index + 1,
          top: 0,
          bottom: map.height,
        });
        return acc.concat(
          cells.map((nodePos) => {
            const node = table.node.nodeAt(nodePos);
            const pos = nodePos + table.start;
            return { pos, start: pos + 1, node };
          }),
        );
      }
      return acc;
    }, []);
  }
}

export function getCellsInRow(selection: Selection, index: number | number[]) {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    const indexes = Array.isArray(index) ? index : Array.from([index]);
    return indexes.reduce<Array<{ pos: number; start: number; node: Node | null | undefined }>>((acc, index) => {
      if (index >= 0 && index <= map.height - 1) {
        const cells = map.cellsInRect({
          left: 0,
          right: map.width,
          top: index,
          bottom: index + 1,
        });
        return acc.concat(
          cells.map((nodePos) => {
            const node = table.node.nodeAt(nodePos);
            const pos = nodePos + table.start;
            return { pos, start: pos + 1, node };
          }),
        );
      }
      return acc;
    }, []);
  }
}

export function getCellInTable(selection: Selection, row: number, col: number) {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    const cells = map.cellsInRect({
      left: row,
      right: row + 1,
      top: col,
      bottom: col + 1,
    });
    if (cells.length) {
      const node = table.node.nodeAt(cells[0]);
      const pos = table.start + cells[0];
      return { pos, node, start: pos + 1 };
    }
  }
  return undefined;
}

export function selectRowOrColumn(type: "row" | "column", tr: Transaction, index: number) {
  const table = findTable(tr.selection);
  const isRowSelection = type === "row";
  if (table) {
    const map = TableMap.get(table.node);

    // Check if the index is valid
    if (index >= 0 && index < (isRowSelection ? map.height : map.width)) {
      const left = isRowSelection ? 0 : index;
      const top = isRowSelection ? index : 0;
      const right = isRowSelection ? map.width : index + 1;
      const bottom = isRowSelection ? index + 1 : map.height;

      const cellsInFirstRow = map.cellsInRect({
        left,
        top,
        right: isRowSelection ? right : left + 1,
        bottom: isRowSelection ? top + 1 : bottom,
      });

      const cellsInLastRow = bottom - top === 1 ?
        cellsInFirstRow :
        map.cellsInRect({
          left: isRowSelection ? left : right - 1,
          top: isRowSelection ? bottom - 1 : top,
          right,
          bottom,
        });

      const head = table.start + cellsInFirstRow[0];
      const anchor = table.start + cellsInLastRow[cellsInLastRow.length - 1];
      const $head = tr.doc.resolve(head);
      const $anchor = tr.doc.resolve(anchor);

      return tr.setSelection(new CellSelection($anchor, $head));
    }
  }
  return tr;
}

export function selectRow(tr: Transaction, index: number) {
  return selectRowOrColumn("row", tr, index);
}

export function selectColumn(tr: Transaction, index: number) {
  return selectRowOrColumn("column", tr, index);
}

export function selectTable(tr: Transaction) {
  const table = findTable(tr.selection);
  if (table) {
    const { map } = TableMap.get(table.node);
    if (map && map.length) {
      const head = table.start + map[0];
      const anchor = table.start + map[map.length - 1];
      const $head = tr.doc.resolve(head);
      const $anchor = tr.doc.resolve(anchor);
      return tr.setSelection(new CellSelection($anchor, $head));
    }
  }
  return tr;
}

export function parseAttributes(value: string) {
  const regex = /([^=\s]+)="?([^"]+)"?/g;
  const attrs: Record<string, string> = {};
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(value))) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

export function setAttributes(editor: Editor, getPos: (() => number) | boolean, attrs: Record<string, any>) {
  if (editor.isEditable && typeof getPos === "function") {
    editor.view.dispatch(
      editor.view.state.tr.setNodeMarkup(getPos(), undefined, attrs),
    );
  }
}