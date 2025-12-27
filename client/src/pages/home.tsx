import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, TrendingUp, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg" data-testid="text-brand">AgencyOS Signals</span>
          </div>
          <Link href="/analyze">
            <Button data-testid="button-start-analysis-header">
              Start Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6" data-testid="text-headline">
              Surface early operational risk before it becomes a crisis
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-subheadline">
              A diagnostic tool for agency founders and leadership teams. Get clear, 
              actionable insights in under 15 minutes per account.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-start-analysis-hero">
                Begin Account Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 border-t border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-semibold text-center mb-12" data-testid="text-how-it-works">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-md bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-semibold text-secondary-foreground">1</span>
                </div>
                <h3 className="font-medium mb-2">Input account data</h3>
                <p className="text-sm text-muted-foreground">
                  Answer structured questions about delivery, scope, and client relationship patterns.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-md bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-semibold text-secondary-foreground">2</span>
                </div>
                <h3 className="font-medium mb-2">Signal analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Rule-based evaluation surfaces patterns that indicate early operational risk.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-md bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-semibold text-secondary-foreground">3</span>
                </div>
                <h3 className="font-medium mb-2">Written diagnostic</h3>
                <p className="text-sm text-muted-foreground">
                  Receive a plain-language report with explanations you can act on immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-semibold text-center mb-12" data-testid="text-signals-title">
              Three core signals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-md bg-accent mb-4 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">Retainer Reality Index</h3>
                  <p className="text-sm text-muted-foreground">
                    Evaluates whether commercial structure aligns with delivery reality. 
                    Flags structural under-scoping and normalized exception handling.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-md bg-accent mb-4 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">Delivery Drift Signal</h3>
                  <p className="text-sm text-muted-foreground">
                    Detects gradual movement from planned delivery into reactive firefighting. 
                    Looks for sustained patterns, not short-term crunch.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-md bg-accent mb-4 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">Client Risk Signal</h3>
                  <p className="text-sm text-muted-foreground">
                    Identifies early relationship instability and churn risk. 
                    Focuses on behavioural trends, not client personality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-border bg-card/50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Built for agency leadership</h2>
            <p className="text-muted-foreground mb-8">
              Designed for founders, MDs, and Heads of Delivery who need clarity, not complexity.
            </p>
            <Link href="/analyze">
              <Button data-testid="button-start-analysis-footer">
                Start Your First Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          AgencyOS Signals - Diagnostic insights for agency operations
        </div>
      </footer>
    </div>
  );
}
