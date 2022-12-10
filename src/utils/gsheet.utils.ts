// see https://theoephraim.github.io/node-google-spreadsheet/#/

import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet, WorksheetGridRange, GoogleSpreadsheetRow } from 'google-spreadsheet';

export const getSpreadSheetDocument = async (sheetId: string, clientEmail: string, privateKey: string): Promise<GoogleSpreadsheet> => {
  /**
   * Create GoogleSpreadsheet instance for the spreadsheet identified by its id,
   * which provides methods to interact with document metadata/settings, formatting, manage sheets,
   * and acts as the main gateway to interacting with sheets and data that the document contains
   */
  const doc = new GoogleSpreadsheet(sheetId);

  // Auth
  await doc.useServiceAccountAuth({
    client_email: clientEmail,
    private_key: privateKey,
  });

  // Loads document properties
  await doc.loadInfo();

  // Return instance
  return doc;
};

/**
 * Handler to get sheet by its name.
 */

export const getSheetByName = (doc: GoogleSpreadsheet, sheetName: string): GoogleSpreadsheetWorksheet => {
  // Return sheet object which provides methods to reach sheet metadata and acts as the gateway to interacting the data it contains
  return doc.sheetsByTitle[sheetName];
};

/**
 * Handler to get cell value.
 */

export const getCellValue = async (sheet: GoogleSpreadsheetWorksheet, rowIndex: number, columnIndex: number): Promise<string | number | boolean> => {
  // Load cell which contains value
  await sheet.loadCells({
    startRowIndex: rowIndex,
    endRowIndex: rowIndex + 1,
    startColumnIndex: columnIndex,
    endColumnIndex: columnIndex + 1,
  });

  // Get value of cell
  return sheet.getCell(rowIndex, columnIndex).value;
};

/**
 * Handler to get data in range of cells
 */

export const getRowsInRange = async (sheet: GoogleSpreadsheetWorksheet, range: WorksheetGridRange): Promise<(string | number | boolean)[][]> => {
  // Declare array to store row objects
  const data: (string | number | boolean)[][] = [];

  // Load cells in range
  await sheet.loadCells(range);

  // Iterate over rows
  for (let currentRow: number = range.startRowIndex; currentRow < range.endRowIndex; currentRow++) {
    // If first value in row is null, stop parsing
    if (sheet.getCell(currentRow, range.startColumnIndex).value === null) break;

    // Declare a container to store values for each cell in row
    const row: (string | number | boolean)[] = [];

    // Iterate over columns
    for (let currentCol: number = range.startColumnIndex; currentCol < range.endColumnIndex; currentCol++) {
      const value = sheet.getCell(currentRow, currentCol).value;
      row.push(value);
    }

    // Push row container to data container
    data.push(row);
  }

  // Return parsed data
  return data;
};

export type TRowHeader = { [header: string]: string | number | boolean };
type TRowValue = (string | number | boolean)[];
type TRowToInsert = TRowValue[] | TRowHeader[];
type TInsertOptions = { raw: boolean; insert: boolean };

/**
 * Handler to write data in a new row
 */

export const addRowWithData = async (
  sheet: GoogleSpreadsheetWorksheet,
  data: TRowToInsert,
  options?: TInsertOptions,
): Promise<void | GoogleSpreadsheetRow[]> => {
  if (!data.length) return;
  return await sheet.addRows(data, options);
};

/**
 * Handler to remove all rows except header
 * NB: bad for quota
 */

export const removeAllRowsExceptHeader = async (sheet: GoogleSpreadsheetWorksheet): Promise<void> => {
  const rows = await sheet.getRows();
  for (let rIndex = 1; rIndex < rows.length; rIndex++) {
    rows[rIndex].del();
  }
};

/**
 * Handler to remove some rows in a range
 * NB: bad for quota
 */
 export const removeRowsByRange = async (sheet: GoogleSpreadsheetWorksheet, indexFrom: number, indexTo: number): Promise<void> => {
  const rows = await sheet.getRows();
  for (let rIndex = indexFrom; rIndex < indexTo; rIndex++) {
    rows[rIndex].del();
  }
};