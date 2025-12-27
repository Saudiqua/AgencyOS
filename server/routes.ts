import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { accountInputSchema } from "@shared/schema";
import { z } from "zod";

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
      
      const htmlContent = generatePdfHtml(report.markdownReport, report.accountName);
      
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Content-Disposition", `attachment; filename="${report.accountName}-diagnostic.html"`);
      res.send(htmlContent);
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

function generatePdfHtml(markdown: string, accountName: string): string {
  const htmlContent = markdown
    .replace(/^# (.+)$/gm, '<h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #1a1a1a;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; color: #1a1a1a;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size: 16px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; color: #1a1a1a;">$1</h3>')
    .replace(/^\*\*(.+?)\*\*$/gm, '<p style="font-weight: 600; margin-top: 12px; margin-bottom: 4px;">$1</p>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color: #666;">$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin-left: 20px; margin-bottom: 4px; color: #333;">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-left: 20px; margin-bottom: 4px; color: #333;"><strong>$1.</strong> $2</li>')
    .replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">')
    .replace(/^(?!<[hplu]|<li|<hr|<em|<strong)(.+)$/gm, '<p style="margin-bottom: 12px; line-height: 1.6; color: #333;">$1</p>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${accountName} - Diagnostic Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: #fff;
    }
    
    @media print {
      body {
        padding: 20px;
      }
    }
    
    ul, ol {
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}
