import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  fileName: string;
  data: any;
  format: 'json' | 'csv' | 'excel' | 'pdf';
}

export const exportData = async ({ fileName, data, format }: ExportOptions): Promise<void> => {
  switch (format) {
    case 'json':
      return exportJson(fileName, data);
    case 'csv':
      return exportCsv(fileName, data);
    case 'excel':
      return exportExcel(fileName, data);
    case 'pdf':
      return exportPdf(fileName, data);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const exportJson = (fileName: string, data: any): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `${fileName}.json`);
};

const exportCsv = (fileName: string, data: any): void => {
  const rows = Array.isArray(data) ? data : [data];
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${fileName}.csv`);
};

const exportExcel = (fileName: string, data: any): void => {
  const rows = Array.isArray(data) ? data : [data];
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}.xlsx`);
};

const exportPdf = async (fileName: string, data: any): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Convert data to string representation
  const content = JSON.stringify(data, null, 2);
  
  // Split content into lines that fit on the page
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const fontSize = 10;
  doc.setFontSize(fontSize);
  
  const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
  
  // Add lines to document
  let y = margin;
  lines.forEach((line: string) => {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += fontSize;
  });
  
  doc.save(`${fileName}.pdf`);
};

// Helper function to clean data for export
export function sanitizeData(data: any[]): any[] {
  return data.map(item => {
    const cleanItem: any = {};
    Object.entries(item).forEach(([key, value]) => {
      // Handle different data types appropriately
      if (value === null || value === undefined) {
        cleanItem[key] = '';
      } else if (typeof value === 'object') {
        cleanItem[key] = JSON.stringify(value);
      } else {
        cleanItem[key] = value;
      }
    });
    return cleanItem;
  });
} 