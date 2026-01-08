import { jsPDF } from "jspdf";

export function generatePdf(markdown: string, accountName: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(accountName, margin, currentY);
  currentY += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text(`Diagnostic Report - Generated ${new Date().toLocaleDateString()}`, margin, currentY);
  currentY += 30;
  doc.setTextColor(0, 0, 0);

  const lines = markdown.split('\n');
  let inList = false;

  for (const line of lines) {
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = margin;
    }

    if (line.startsWith('# ')) {
      if (inList) { currentY += 10; inList = false; }
      currentY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(26, 26, 26);
      const wrapped = doc.splitTextToSize(line.substring(2), contentWidth);
      doc.text(wrapped, margin, currentY);
      currentY += wrapped.length * 24;
      doc.setTextColor(0, 0, 0);
    } else if (line.startsWith('## ')) {
      if (inList) { currentY += 10; inList = false; }
      currentY += 18;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(26, 26, 26);
      const wrapped = doc.splitTextToSize(line.substring(3), contentWidth);
      doc.text(wrapped, margin, currentY);
      currentY += wrapped.length * 20;
      doc.setTextColor(0, 0, 0);
    } else if (line.startsWith('### ')) {
      if (inList) { currentY += 10; inList = false; }
      currentY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(26, 26, 26);
      const wrapped = doc.splitTextToSize(line.substring(4), contentWidth);
      doc.text(wrapped, margin, currentY);
      currentY += wrapped.length * 16;
      doc.setTextColor(0, 0, 0);
    } else if (line.startsWith('- ')) {
      if (!inList) { currentY += 6; inList = true; }
      const bulletText = line.substring(2);
      const processedText = processMarkdown(bulletText);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text('•', margin, currentY);

      currentY = renderFormattedText(doc, processedText, margin + 15, currentY, contentWidth - 15);
      currentY += 4;
    } else if (line.match(/^\d+\. /)) {
      if (!inList) { currentY += 6; inList = true; }
      const match = line.match(/^(\d+)\. (.+)$/);
      if (match) {
        const number = match[1];
        const text = match[2];
        const processedText = processMarkdown(text);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`${number}.`, margin, currentY);

        currentY = renderFormattedText(doc, processedText, margin + 20, currentY, contentWidth - 20);
        currentY += 4;
      }
    } else if (line === '---') {
      if (inList) { currentY += 10; inList = false; }
      currentY += 12;
      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(1);
      doc.line(margin, currentY, margin + contentWidth, currentY);
      currentY += 12;
    } else if (line.trim() !== '') {
      if (inList) { currentY += 6; inList = false; }
      const processedText = processMarkdown(line);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      currentY = renderFormattedText(doc, processedText, margin, currentY, contentWidth);
      currentY += 8;
      doc.setTextColor(0, 0, 0);
    } else {
      if (inList) { inList = false; }
      currentY += 6;
    }
  }

  const filename = `${accountName.replace(/[^a-z0-9]/gi, '_')}-diagnostic.pdf`;
  doc.save(filename);
}

type TextPart = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

function processMarkdown(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let current = '';
  let i = 0;

  while (i < text.length) {
    if (text.substring(i, i + 2) === '**') {
      if (current) {
        parts.push({ text: current });
        current = '';
      }
      i += 2;
      const end = text.indexOf('**', i);
      if (end !== -1) {
        parts.push({ text: text.substring(i, end), bold: true });
        i = end + 2;
      } else {
        current += '**';
      }
    } else if (text[i] === '*' && text[i + 1] !== '*') {
      if (current) {
        parts.push({ text: current });
        current = '';
      }
      i += 1;
      const end = text.indexOf('*', i);
      if (end !== -1 && text[end + 1] !== '*') {
        parts.push({ text: text.substring(i, end), italic: true });
        i = end + 1;
      } else {
        current += '*';
      }
    } else {
      current += text[i];
      i++;
    }
  }

  if (current) {
    parts.push({ text: current });
  }

  return parts;
}

function renderFormattedText(
  doc: jsPDF,
  parts: TextPart[],
  x: number,
  y: number,
  maxWidth: number
): number {
  let currentX = x;
  let currentY = y;
  const lineHeight = 14;

  for (const part of parts) {
    if (part.bold) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 51, 51);
    } else if (part.italic) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(102, 102, 102);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 51, 51);
    }

    const words = part.text.split(' ');
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      const wordWidth = doc.getTextWidth(word);

      if (currentX + wordWidth > x + maxWidth && currentX > x) {
        currentY += lineHeight;
        currentX = x;
      }

      doc.text(word, currentX, currentY);
      currentX += wordWidth;
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  return currentY + lineHeight;
}
