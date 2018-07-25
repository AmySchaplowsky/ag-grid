// Type definitions for ag-grid v18.1.2-beta.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class ColumnKeyCreator {
    private existingKeys;
    getUniqueKey(colId: string, colField: string): string;
}