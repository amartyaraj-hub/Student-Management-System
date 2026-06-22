import ExcelJS from 'exceljs';

/**
 * Generates and streams an Excel sheet report.
 * @param {Response} res Express response stream
 * @param {string} sheetName Name of the worksheet tab
 * @param {string[]} headers Header strings
 * @param {any[][]} rows Data cells
 */
export const generateExcelReport = async (res, sheetName, headers, rows) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Add headers
  const headerRow = worksheet.addRow(headers);
  
  // Style headers
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' } // Dark blue primary color
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
  headerRow.height = 25;

  // Add rows
  rows.forEach((row) => {
    const r = worksheet.addRow(row);
    r.height = 20;
    r.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      // Draw grid borders
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      };
    });
  });

  // Auto-adjust column widths
  worksheet.columns.forEach((col) => {
    let maxLen = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? String(cell.value) : '';
      if (val.length > maxLen) {
        maxLen = val.length;
      }
    });
    col.width = Math.max(maxLen + 4, 12); // minimum width of 12
  });

  // Write sheet to the response stream
  await workbook.xlsx.write(res);
};
