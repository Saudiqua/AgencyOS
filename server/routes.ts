import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { accountInputSchema } from "@shared/schema";
import { z } from "zod";
import PDFDocument from "pdfkit";
import MarkdownIt from "markdown-it";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      const validatedInput = accountInputSchema.parse(req.body);
      const result = await storage.createAnalysis(validatedInput);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        console.error("Analysis error:", error);
        res.status(500).json({ error: "Failed to process analysis" });
      }
    }
  });

  app.get("/api/reports/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const report = await storage.getAnalysis(id);
      
      if (!report) {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      
      res.json(report);
    } catch (error) {
      console.error("Get report error:", error);
      res.status(500).json({ error: "Failed to retrieve report" });
    }
  });

  app.get("/api/reports/:id/pdf", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const report = await storage.getAnalysis(id);

      if (!report) {
        res.status(404).json({ error: "Report not found" });
        return;
      }

      const filename = `${report.accountName.replace(/[^a-z0-9]/gi, '_')}-diagnostic.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      doc.pipe(res);

      generatePdf(doc, report.markdownReport, report.accountName);

      doc.end();
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  app.get("/api/reports", async (_req: Request, res: Response) => {
    try {
      const reports = await storage.getAllAnalyses();
      res.json(reports);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ error: "Failed to retrieve reports" });
    }
  });

  return httpServer;
}

function generatePdf(doc: PDFDocument, markdown: string, accountName: string): void {
  const lines = markdown.split('\n');
  let currentY = doc.y;
  const pageWidth = doc.page.width - 100;
  let inList = false;

  doc.fontSize(24).font('Helvetica-Bold').text(accountName, { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#666666')
    .text(`Diagnostic Report - Generated ${new Date().toLocaleDateString()}`, { align: 'left' });
  doc.moveDown(1.5);
  doc.fillColor('#000000');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }

    if (line.startsWith('# ')) {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.moveDown(0.5);
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a1a1a')
        .text(line.substring(2), { width: pageWidth });
      doc.moveDown(0.5);
      doc.fillColor('#000000');
    } else if (line.startsWith('## ')) {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.moveDown(0.8);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a1a1a')
        .text(line.substring(3), { width: pageWidth });
      doc.moveDown(0.4);
      doc.fillColor('#000000');
    } else if (line.startsWith('### ')) {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.moveDown(0.5);
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a1a')
        .text(line.substring(4), { width: pageWidth });
      doc.moveDown(0.3);
      doc.fillColor('#000000');
    } else if (line.startsWith('- ')) {
      if (!inList) { doc.moveDown(0.3); inList = true; }
      const bulletText = line.substring(2);
      const processedText = processBoldItalic(bulletText);

      doc.fontSize(11).font('Helvetica');
      const bulletX = doc.x;
      doc.text('•', bulletX, doc.y, { continued: true, width: 15 });
      renderFormattedText(doc, processedText, bulletX + 15, pageWidth - 15);
      doc.moveDown(0.2);
    } else if (line.match(/^\d+\. /)) {
      if (!inList) { doc.moveDown(0.3); inList = true; }
      const match = line.match(/^(\d+)\. (.+)$/);
      if (match) {
        const number = match[1];
        const text = match[2];
        const processedText = processBoldItalic(text);

        doc.fontSize(11).font('Helvetica');
        const numberX = doc.x;
        doc.text(`${number}.`, numberX, doc.y, { continued: true, width: 20 });
        renderFormattedText(doc, processedText, numberX + 20, pageWidth - 20);
        doc.moveDown(0.2);
      }
    } else if (line === '---') {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.moveDown(0.5);
      doc.strokeColor('#e5e5e5').lineWidth(1)
        .moveTo(doc.x, doc.y).lineTo(doc.x + pageWidth, doc.y).stroke();
      doc.moveDown(0.5);
      doc.strokeColor('#000000');
    } else if (line.trim() !== '') {
      if (inList) { doc.moveDown(0.3); inList = false; }
      const processedText = processBoldItalic(line);
      doc.fontSize(11).font('Helvetica').fillColor('#333333');
      renderFormattedText(doc, processedText, doc.x, pageWidth);
      doc.moveDown(0.4);
      doc.fillColor('#000000');
    } else {
      if (inList) { inList = false; }
      doc.moveDown(0.3);
    }
  }
}

function processBoldItalic(text: string): Array<{ text: string; bold?: boolean; italic?: boolean }> {
  const parts: Array<{ text: string; bold?: boolean; italic?: boolean }> = [];
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

function renderFormattedText(doc: PDFDocument, parts: Array<{ text: string; bold?: boolean; italic?: boolean }>, x: number, width: number): void {
  doc.x = x;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;

    if (part.bold) {
      doc.font('Helvetica-Bold');
    } else if (part.italic) {
      doc.font('Helvetica-Oblique').fillColor('#666666');
    } else {
      doc.font('Helvetica').fillColor('#333333');
    }

    doc.text(part.text, { continued: !isLast, width });

    if (part.italic) {
      doc.fillColor('#333333');
    }
  }

  doc.font('Helvetica');
}
