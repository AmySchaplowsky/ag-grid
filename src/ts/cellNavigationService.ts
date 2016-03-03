import {Bean} from "./context/context";
import {Constants} from "./constants";
import {Autowired} from "./context/context";
import {ColumnController} from "./columnController/columnController";
import {IRowModel} from "./interfaces/iRowModel";
import {Column} from "./entities/column";
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {Utils as _} from './utils';
import {GridRow} from "./entities/gridCell";
import {GridCell} from "./entities/gridCell";

@Bean('cellNavigationService')
export class CellNavigationService {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;

    public getNextCellToFocus(key: any, lastCellToFocus: GridCell): GridCell {
        switch (key) {
            case Constants.KEY_UP : return this.getCellAbove(lastCellToFocus);
            case Constants.KEY_DOWN : return this.getCellBelow(lastCellToFocus);
            case Constants.KEY_RIGHT : return this.getCellToRight(lastCellToFocus);
            case Constants.KEY_LEFT : return this.getCellToLeft(lastCellToFocus);
            default : console.log('ag-Grid: unknown key for navigation ' + key);
        }
    }

    private getCellToLeft(lastCell: GridCell): GridCell {
        var colToLeft = this.columnController.getDisplayedColBefore(lastCell.column);
        if (!colToLeft) {
            return null;
        } else {
            return new GridCell(lastCell.rowIndex, lastCell.floating, colToLeft);
        }
    }

    private getCellToRight(lastCell: GridCell): GridCell {
        var colToRight = this.columnController.getDisplayedColAfter(lastCell.column);
        // if already on right, do nothing
        if (!colToRight) {
            return null;
        } else {
            return new GridCell(lastCell.rowIndex, lastCell.floating, colToRight);
        }
    }

    public getRowBelow(lastRow: GridRow): GridRow {
        // if already on top row, do nothing
        if (this.isLastRowInContainer(lastRow)) {

            if (lastRow.isFloatingBottom()) {
                return null;
            } else if (lastRow.isNotFloating()) {
                if (this.floatingRowModel.isRowsToRender(Constants.FLOATING_BOTTOM)) {
                    return new GridRow(0, Constants.FLOATING_BOTTOM);
                } else {
                    return null;
                }
            } else {
                if (this.rowModel.isRowsToRender()) {
                    return new GridRow(0, null);
                } else if (this.floatingRowModel.isRowsToRender(Constants.FLOATING_BOTTOM)) {
                    return new GridRow(0, Constants.FLOATING_BOTTOM);
                } else {
                    return null;
                }
            }

        } else {
            return new GridRow(lastRow.rowIndex + 1, lastRow.floating);
        }

    }

    private getCellBelow(lastCell: GridCell): GridCell {
        var rowBelow = this.getRowBelow(lastCell.getGridRow());
        return new GridCell(rowBelow.rowIndex, rowBelow.floating, lastCell.column);
    }

    private isLastRowInContainer(gridRow: GridRow): boolean {
        if (gridRow.isFloatingTop()) {
            var lastTopIndex = this.floatingRowModel.getFloatingTopRowData().length - 1;
            return lastTopIndex === gridRow.rowIndex;
        } else if (gridRow.isFloatingBottom()) {
            var lastBottomIndex = this.floatingRowModel.getFloatingBottomRowData().length - 1;
            return lastBottomIndex === gridRow.rowIndex;
        } else {
            var lastBodyIndex = this.rowModel.getRowCount() - 1;
            return lastBodyIndex === gridRow.rowIndex;
        }
    }

    private getRowAbove(lastRow: GridRow): GridRow {
        // if already on top row, do nothing
        if (lastRow.rowIndex === 0) {
            if (lastRow.isFloatingTop()) {
                return null;
            } else if (lastRow.isNotFloating()) {
                if (this.floatingRowModel.isRowsToRender(Constants.FLOATING_TOP)) {
                    return this.getLastFloatingTopRow();
                } else {
                    return null;
                }
            } else {
                // last floating bottom
                if (this.rowModel.isRowsToRender()) {
                    return this.getLastBodyCell();
                } else if (this.floatingRowModel.isRowsToRender(Constants.FLOATING_TOP)) {
                    return this.getLastFloatingTopRow();
                } else {
                    return null;
                }
            }

        } else {
            return new GridRow(lastRow.rowIndex - 1, lastRow.floating);
        }

    }

    private getCellAbove(lastCell: GridCell): GridCell {
        var rowAbove = this.getRowAbove(lastCell.getGridRow());
        return new GridCell(rowAbove.rowIndex, rowAbove.floating, lastCell.column);
    }

    private getLastBodyCell(): GridRow {
        var lastBodyRow = this.rowModel.getRowCount() - 1;
        return new GridRow(lastBodyRow, null);
    }

    private getLastFloatingTopRow(): GridRow {
        var lastFloatingRow = this.floatingRowModel.getFloatingTopRowData().length - 1;
        return new GridRow(lastFloatingRow, Constants.FLOATING_TOP);
    }

    public getNextTabbedCellForwards(gridCell: GridCell): GridCell {

        var displayedColumns = this.columnController.getAllDisplayedColumns();

        var newRowIndex = gridCell.rowIndex;
        var newFloating = gridCell.floating;

        // move along to the next cell
        var newColumn = this.columnController.getDisplayedColAfter(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];

            var rowBelow = this.getRowBelow(gridCell.getGridRow());
            if (_.missing(rowBelow)) {
                return;
            }
            newRowIndex = rowBelow.rowIndex;
            newFloating = rowBelow.floating;
        }

        return new GridCell(newRowIndex, newFloating, newColumn);
    }

    public getNextTabbedCellBackwards(gridCell: GridCell): GridCell {

        var displayedColumns = this.columnController.getAllDisplayedColumns();

        var newRowIndex = gridCell.rowIndex;
        var newFloating = gridCell.floating;

        // move along to the next cell
        var newColumn = this.columnController.getDisplayedColBefore(gridCell.column);

        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[displayedColumns.length - 1];

            var rowAbove = this.getRowAbove(gridCell.getGridRow());
            if (_.missing(rowAbove)) {
                return;
            }
            newRowIndex = rowAbove.rowIndex;
            newFloating = rowAbove.floating;
        }

        return new GridCell(newRowIndex, newFloating, newColumn);
    }

}