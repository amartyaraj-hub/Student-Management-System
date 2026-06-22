import PDFDocument from 'pdfkit';

/**
 * Generates a styled PDF table report.
 * @param {Response} res Express response stream
 * @param {string} title Document title
 * @param {string[]} headers Array of table headers
 * @param {any[][]} rows Array of table data rows
 */
export const generatePDFReport = (res, title, headers, rows) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream output to express response
  doc.pipe(res);

  // Set up Header Banner
  doc.rect(0, 0, 595.28, 80).fill('#1e3a8a'); // dark blue primary
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text(title, 40, 30, { align: 'left' });

  // Subtitle / Date stamp
  const timestamp = new Date().toLocaleString();
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(`Generated on: ${timestamp}`, 40, 55);

  // Position cursor below header banner
  doc.y = 110;

  // Grid Table Settings
  const tableTop = 110;
  const colCount = headers.length;
  const tableWidth = 515.28; // 595.28 - 2 * 40 margin
  const colWidth = tableWidth / colCount;
  const rowHeight = 22;

  // Draw Table Headers
  doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
  let currentX = 40;
  
  // Header background rectangle
  doc.rect(40, doc.y, tableWidth, rowHeight).fill('#f1f5f9');
  doc.fillColor('#1e293b');

  headers.forEach((header, index) => {
    doc.text(header, currentX + 5, doc.y + 6, {
      width: colWidth - 10,
      align: 'left'
    });
    currentX += colWidth;
  });

  doc.y += rowHeight;

  // Draw Table Rows
  doc.font('Helvetica').fontSize(8.5);
  
  rows.forEach((row, rowIndex) => {
    // Page breaking calculation
    if (doc.y + rowHeight > 780) {
      doc.addPage({ margin: 40, size: 'A4' });
      
      // Reprint headers on new page
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
      doc.rect(40, 40, tableWidth, rowHeight).fill('#f1f5f9');
      doc.fillColor('#1e293b');
      let headerX = 40;
      headers.forEach((header) => {
        doc.text(header, headerX + 5, 46, { width: colWidth - 10 });
        headerX += colWidth;
      });
      doc.y = 40 + rowHeight;
      doc.font('Helvetica').fontSize(8.5);
    }

    // Alternating shading for rows
    if (rowIndex % 2 === 0) {
      doc.rect(40, doc.y, tableWidth, rowHeight).fill('#fafafa');
    }

    doc.fillColor('#334155');
    let cellX = 40;
    row.forEach((cell) => {
      const cellText = String(cell !== undefined && cell !== null ? cell : '');
      doc.text(cellText, cellX + 5, doc.y + 7, {
        width: colWidth - 10,
        height: rowHeight,
        ellipsis: true
      });
      cellX += colWidth;
    });

    // Draw horizontal row separator
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, doc.y + rowHeight).lineTo(40 + tableWidth, doc.y + rowHeight).stroke();

    doc.y += rowHeight;
  });

  // Footer page numbers
  const pageRange = doc.bufferedPageRange();
  for (let i = 0; i < pageRange.count; i++) {
    doc.switchToPage(i);
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(40, 800).lineTo(555.28, 800).stroke();
    doc.fillColor('#64748b').fontSize(8).text(`Page ${i + 1} of ${pageRange.count}`, 40, 808, { align: 'center' });
  }

  doc.end();
};
