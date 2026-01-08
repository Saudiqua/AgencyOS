import { useParams, Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ArrowLeft, Download, FileText, Plus, TrendingUp, ArrowRight, Users, AlertCircle } from "lucide-react";
import type { AnalysisResult, SignalLevel } from "@shared/schema";
import { getReport } from "@/lib/storage";
import { generatePdf } from "@/lib/pdf-generator";

function SignalLevelBadge({ level }: { level: SignalLevel }) {
  const variants: Record<SignalLevel, string> = {
    low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    moderate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    elevated: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    high: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  };

  const labels: Record<SignalLevel, string> = {
    low: "Low",
    moderate: "Moderate",
    elevated: "Elevated",
    high: "High",
  };

  return (
    <Badge className={`${variants[level]} border-0 font-medium`} data-testid={`badge-level-${level}`}>
      {labels[level]}
    </Badge>
  );
}

function SignalCard({ 
  title, 
  icon: Icon, 
  signal 
}: { 
  title: string; 
  icon: typeof TrendingUp;
  signal: { level: SignalLevel; score: number; explanation: string; factors: string[]; recommendations: string[] };
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center">
              <Icon className="w-5 h-5 text-accent-foreground" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <SignalLevelBadge level={signal.level} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{signal.explanation}</p>
        
        {signal.factors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Contributing Factors</h4>
            <ul className="space-y-1">
              {signal.factors.map((factor, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-foreground mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {signal.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {signal.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Report() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!params.id) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const loadedReport = getReport(params.id);
      if (loadedReport) {
        setReport(loadedReport);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error("Error loading report:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const handleDownloadPdf = () => {
    if (!report) return;

    try {
      generatePdf(report.markdownReport, report.accountName);
    } catch (error) {
      console.error("PDF generation error:", error);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!report?.markdownReport) return;

    const blob = new Blob([report.markdownReport], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.accountName}-diagnostic.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md p-1 -m-1 cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">AgencyOS Signals</span>
            </div>
          </Link>
          
          {report && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleDownloadMarkdown} data-testid="button-download-markdown">
                <FileText className="w-4 h-4 mr-2" />
                Markdown
              </Button>
              <Button size="sm" onClick={handleDownloadPdf} data-testid="button-download-pdf">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/analyze">
              <Button variant="ghost" size="sm" className="mb-4" data-testid="button-new-analysis">
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </Link>
          </div>

          {isLoading && <ReportSkeleton />}

          {isError && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  The requested report could not be found or may have expired.
                </p>
                <Link href="/analyze">
                  <Button data-testid="button-start-new-analysis">
                    Start New Analysis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {report && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-4 flex-wrap mb-2">
                  <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-account-name">
                    {report.accountName}
                  </h1>
                  <SignalLevelBadge level={report.overallAssessment.level} />
                </div>
                <p className="text-muted-foreground" data-testid="text-analysis-date">
                  Analysis completed {new Date(report.analysisDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground" data-testid="text-summary">
                    {report.overallAssessment.summary}
                  </p>
                  
                  {report.overallAssessment.keyFindings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Findings</h4>
                      <ul className="space-y-1">
                        {report.overallAssessment.keyFindings.map((finding, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-foreground mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.overallAssessment.priorityActions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Priority Actions</h4>
                      <ul className="space-y-1">
                        {report.overallAssessment.priorityActions.map((action, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-6">Signal Analysis</h2>
                <div className="grid lg:grid-cols-3 gap-6">
                  <SignalCard 
                    title="Retainer Reality" 
                    icon={TrendingUp}
                    signal={report.retainerRealitySignal}
                  />
                  <SignalCard 
                    title="Delivery Drift" 
                    icon={ArrowRight}
                    signal={report.deliveryDriftSignal}
                  />
                  <SignalCard 
                    title="Client Risk" 
                    icon={Users}
                    signal={report.clientRiskSignal}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-center gap-4 flex-wrap py-8">
                <Link href="/analyze">
                  <Button variant="outline" data-testid="button-analyze-another">
                    <Plus className="w-4 h-4 mr-2" />
                    Analyze Another Account
                  </Button>
                </Link>
                <Button onClick={handleDownloadPdf} data-testid="button-download-pdf-footer">
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
