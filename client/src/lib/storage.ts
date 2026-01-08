import type { AnalysisResult } from "@shared/schema";

const STORAGE_KEY = "agencyos-signals-reports";

export function saveReport(report: AnalysisResult): void {
  try {
    const reports = getAllReports();
    reports.push(report);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error("Failed to save report:", error);
    throw new Error("Failed to save report to localStorage");
  }
}

export function getReport(id: string): AnalysisResult | undefined {
  try {
    const reports = getAllReports();
    return reports.find(report => report.id === id);
  } catch (error) {
    console.error("Failed to get report:", error);
    return undefined;
  }
}

export function getAllReports(): AnalysisResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as AnalysisResult[];
  } catch (error) {
    console.error("Failed to get all reports:", error);
    return [];
  }
}

export function deleteReport(id: string): void {
  try {
    const reports = getAllReports();
    const filtered = reports.filter(report => report.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete report:", error);
    throw new Error("Failed to delete report from localStorage");
  }
}

export function clearAllReports(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear reports:", error);
    throw new Error("Failed to clear reports from localStorage");
  }
}
