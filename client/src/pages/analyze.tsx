import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";
import { accountInputSchema, type AccountInput } from "@shared/schema";
import { createAnalysis } from "@/lib/analysis";
import { saveReport } from "@/lib/storage";

const steps = [
  { id: 1, title: "Account Details", description: "Basic information about the client account" },
  { id: 2, title: "Retainer Reality", description: "Scope and delivery alignment" },
  { id: 3, title: "Delivery Drift", description: "Planned vs reactive patterns" },
  { id: 4, title: "Client Risk", description: "Relationship health indicators" },
];

export default function Analyze() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();

  const form = useForm<AccountInput>({
    resolver: zodResolver(accountInputSchema),
    defaultValues: {
      accountName: "",
      clientIndustry: "",
      retainerMonthlyValue: 0,
      accountTenure: "established",
      teamSize: 1,
      notes: "",
      retainerReality: {
        scopedHoursPerMonth: 0,
        actualHoursDelivered: 0,
        seniorInvolvementFrequency: "occasionally",
        scopeChangeRequests: 0,
        exceptionHandlingNormalized: false,
      },
      deliveryDrift: {
        plannedVsReactiveRatio: 80,
        lastMinuteRequestsPerWeek: 0,
        missedDeadlinesLast3Months: 0,
        teamOvertime: "none",
        processAdherenceLevel: "moderate",
      },
      clientRisk: {
        stakeholderAccessibility: "good",
        feedbackTone: "neutral",
        responseTimeToRequests: "normal",
        scopeCreepBehaviour: "occasional",
        paymentBehaviour: "on_time",
        recentEscalations: 0,
      },
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AccountInput) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = createAnalysis(data);
      saveReport(result);
      setLocation(`/report/${result.id}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("An error occurred while generating the report. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof AccountInput)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["accountName", "accountTenure", "teamSize"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["retainerReality"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["deliveryDrift"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["clientRisk"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === 4) {
      form.handleSubmit((data) => handleSubmit(data))();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md p-1 -m-1 cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">AgencyOS Signals</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight mb-2" data-testid="text-page-title">
              Account Analysis
            </h1>
            <p className="text-muted-foreground">
              Complete the form below to generate a diagnostic report for this account.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div 
                      className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep > step.id 
                          ? "bg-primary text-primary-foreground" 
                          : currentStep === step.id 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary text-secondary-foreground"
                      }`}
                      data-testid={`step-indicator-${step.id}`}
                    >
                      {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={`text-xs mt-2 text-center hidden sm:block ${
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <Card>
                <CardHeader>
                  <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                  <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentStep === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="accountName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Acme Corporation" 
                                {...field} 
                                data-testid="input-account-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientIndustry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Technology, Finance, Healthcare" 
                                {...field} 
                                data-testid="input-industry"
                              />
                            </FormControl>
                            <FormDescription>Optional - helps contextualize patterns</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="retainerMonthlyValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Retainer Value</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  className="font-mono"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-retainer-value"
                                />
                              </FormControl>
                              <FormDescription>Optional - in your currency</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="teamSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team Size *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  className="font-mono"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  data-testid="input-team-size"
                                />
                              </FormControl>
                              <FormDescription>Number of people on this account</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="accountTenure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Tenure *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-account-tenure">
                                  <SelectValue placeholder="Select tenure" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="new">New (0-6 months)</SelectItem>
                                <SelectItem value="established">Established (6-24 months)</SelectItem>
                                <SelectItem value="longstanding">Longstanding (2+ years)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Context</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any additional observations or context about this account..."
                                rows={4}
                                {...field}
                                data-testid="input-notes"
                              />
                            </FormControl>
                            <FormDescription>Optional notes for your reference</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="retainerReality.scopedHoursPerMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Scoped Hours Per Month</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  className="font-mono"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-scoped-hours"
                                />
                              </FormControl>
                              <FormDescription>Hours included in retainer agreement</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="retainerReality.actualHoursDelivered"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Actual Hours Delivered</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  className="font-mono"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-actual-hours"
                                />
                              </FormControl>
                              <FormDescription>Average monthly hours actually delivered</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="retainerReality.seniorInvolvementFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senior Staff Involvement</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-senior-involvement">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="rarely">Rarely - Strategic oversight only</SelectItem>
                                <SelectItem value="occasionally">Occasionally - For key deliverables</SelectItem>
                                <SelectItem value="frequently">Frequently - Regular hands-on work</SelectItem>
                                <SelectItem value="constantly">Constantly - Required for most work</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How often do senior staff need to step in on this account?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="retainerReality.scopeChangeRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scope Change Requests (Last 3 Months)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                className="font-mono"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-scope-changes"
                              />
                            </FormControl>
                            <FormDescription>Number of scope changes or additions requested</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="retainerReality.exceptionHandlingNormalized"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Exception Handling Normalized</FormLabel>
                              <FormDescription>
                                Are out-of-scope requests regularly handled as part of normal delivery?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-exception-handling"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="deliveryDrift.plannedVsReactiveRatio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Planned Work Percentage</FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  className="font-mono w-24"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-planned-ratio"
                                />
                              </FormControl>
                              <span className="text-muted-foreground">% planned vs reactive work</span>
                            </div>
                            <FormDescription>
                              What percentage of time is spent on planned work vs. reactive requests?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryDrift.lastMinuteRequestsPerWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last-Minute Requests Per Week</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                className="font-mono"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-last-minute-requests"
                              />
                            </FormControl>
                            <FormDescription>Average number of urgent requests received weekly</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryDrift.missedDeadlinesLast3Months"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Missed Internal Deadlines (Last 3 Months)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                className="font-mono"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-missed-deadlines"
                              />
                            </FormControl>
                            <FormDescription>Number of internal deadlines missed on this account</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryDrift.teamOvertime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team Overtime Pattern</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-overtime">
                                  <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None - Standard hours maintained</SelectItem>
                                <SelectItem value="occasional">Occasional - Rare extended hours</SelectItem>
                                <SelectItem value="regular">Regular - Weekly extended hours</SelectItem>
                                <SelectItem value="constant">Constant - Overtime is the norm</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How often does the team work beyond normal hours?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryDrift.processAdherenceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Process Adherence</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-process-adherence">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="strong">Strong - Processes consistently followed</SelectItem>
                                <SelectItem value="moderate">Moderate - Mostly followed with exceptions</SelectItem>
                                <SelectItem value="weak">Weak - Often bypassed for speed</SelectItem>
                                <SelectItem value="absent">Absent - No clear processes exist</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How well are delivery processes followed on this account?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      <FormField
                        control={form.control}
                        name="clientRisk.stakeholderAccessibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stakeholder Accessibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-stakeholder-accessibility">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="excellent">Excellent - Always responsive</SelectItem>
                                <SelectItem value="good">Good - Generally available</SelectItem>
                                <SelectItem value="limited">Limited - Often hard to reach</SelectItem>
                                <SelectItem value="poor">Poor - Rarely accessible</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How accessible is the key client stakeholder?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientRisk.feedbackTone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recent Feedback Tone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-feedback-tone">
                                  <SelectValue placeholder="Select tone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="positive">Positive - Enthusiastic and appreciative</SelectItem>
                                <SelectItem value="neutral">Neutral - Factual and businesslike</SelectItem>
                                <SelectItem value="mixed">Mixed - Some concerns raised</SelectItem>
                                <SelectItem value="negative">Negative - Frequent criticism</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>What has been the tone of recent client feedback?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientRisk.responseTimeToRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Response Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-response-time">
                                  <SelectValue placeholder="Select speed" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fast">Fast - Same day responses</SelectItem>
                                <SelectItem value="normal">Normal - 1-2 day responses</SelectItem>
                                <SelectItem value="slow">Slow - 3-5 day responses</SelectItem>
                                <SelectItem value="very_slow">Very Slow - Week+ delays</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How quickly does the client respond to requests?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientRisk.scopeCreepBehaviour"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scope Creep Behaviour</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-scope-creep">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None - Respects scope boundaries</SelectItem>
                                <SelectItem value="occasional">Occasional - Rare extras requested</SelectItem>
                                <SelectItem value="frequent">Frequent - Regular additional asks</SelectItem>
                                <SelectItem value="constant">Constant - Scope boundaries ignored</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How often does the client push beyond agreed scope?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientRisk.paymentBehaviour"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Behaviour</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-payment-behaviour">
                                  <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="early">Early - Pays before due date</SelectItem>
                                <SelectItem value="on_time">On Time - Pays by due date</SelectItem>
                                <SelectItem value="delayed">Delayed - Often 1-2 weeks late</SelectItem>
                                <SelectItem value="very_delayed">Very Delayed - Significant delays</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>What is the client's payment pattern?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientRisk.recentEscalations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recent Escalations (Last 3 Months)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                className="font-mono"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-escalations"
                              />
                            </FormControl>
                            <FormDescription>Number of issues escalated beyond day-to-day contact</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-4 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </div>

                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isProcessing}
                  data-testid="button-next"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : currentStep === 4 ? (
                    <>
                      Generate Report
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-error">
                  {error}
                </div>
              )}
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
