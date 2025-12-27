import { z } from "zod";

export const signalLevelSchema = z.enum(["low", "moderate", "elevated", "high"]);
export type SignalLevel = z.infer<typeof signalLevelSchema>;

export const retainerRealityInputSchema = z.object({
  scopedHoursPerMonth: z.number().min(0).describe("Hours scoped in retainer"),
  actualHoursDelivered: z.number().min(0).describe("Actual hours delivered on average"),
  seniorInvolvementFrequency: z.enum(["rarely", "occasionally", "frequently", "constantly"]).describe("How often do senior staff step in?"),
  scopeChangeRequests: z.number().min(0).describe("Number of scope changes in last 3 months"),
  exceptionHandlingNormalized: z.boolean().describe("Are exceptions handled as part of normal delivery?"),
});
export type RetainerRealityInput = z.infer<typeof retainerRealityInputSchema>;

export const deliveryDriftInputSchema = z.object({
  plannedVsReactiveRatio: z.number().min(0).max(100).describe("Percentage of time on planned work vs reactive"),
  lastMinuteRequestsPerWeek: z.number().min(0).describe("Average last-minute requests per week"),
  missedDeadlinesLast3Months: z.number().min(0).describe("Number of missed internal deadlines"),
  teamOvertime: z.enum(["none", "occasional", "regular", "constant"]).describe("Team overtime patterns"),
  processAdherenceLevel: z.enum(["strong", "moderate", "weak", "absent"]).describe("How well are processes followed?"),
});
export type DeliveryDriftInput = z.infer<typeof deliveryDriftInputSchema>;

export const clientRiskInputSchema = z.object({
  stakeholderAccessibility: z.enum(["excellent", "good", "limited", "poor"]).describe("How accessible is the key stakeholder?"),
  feedbackTone: z.enum(["positive", "neutral", "mixed", "negative"]).describe("Tone of recent feedback"),
  responseTimeToRequests: z.enum(["fast", "normal", "slow", "very_slow"]).describe("Client response times"),
  scopeCreepBehaviour: z.enum(["none", "occasional", "frequent", "constant"]).describe("Frequency of scope creep"),
  paymentBehaviour: z.enum(["early", "on_time", "delayed", "very_delayed"]).describe("Payment patterns"),
  recentEscalations: z.number().min(0).describe("Number of escalations in last 3 months"),
});
export type ClientRiskInput = z.infer<typeof clientRiskInputSchema>;

export const accountInputSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  clientIndustry: z.string().optional(),
  retainerMonthlyValue: z.number().min(0).optional(),
  accountTenure: z.enum(["new", "established", "longstanding"]).describe("How long has this account been active?"),
  teamSize: z.number().min(1).describe("Number of team members on this account"),
  notes: z.string().optional().describe("Additional context or observations"),
  retainerReality: retainerRealityInputSchema,
  deliveryDrift: deliveryDriftInputSchema,
  clientRisk: clientRiskInputSchema,
});
export type AccountInput = z.infer<typeof accountInputSchema>;

export const insertAccountInputSchema = accountInputSchema;
export type InsertAccountInput = z.infer<typeof insertAccountInputSchema>;

export const signalResultSchema = z.object({
  level: signalLevelSchema,
  score: z.number().min(0).max(100),
  explanation: z.string(),
  factors: z.array(z.string()),
  recommendations: z.array(z.string()),
});
export type SignalResult = z.infer<typeof signalResultSchema>;

export const analysisResultSchema = z.object({
  id: z.string(),
  accountName: z.string(),
  analysisDate: z.string(),
  retainerRealitySignal: signalResultSchema,
  deliveryDriftSignal: signalResultSchema,
  clientRiskSignal: signalResultSchema,
  overallAssessment: z.object({
    level: signalLevelSchema,
    summary: z.string(),
    keyFindings: z.array(z.string()),
    priorityActions: z.array(z.string()),
  }),
  markdownReport: z.string(),
});
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const agencySummarySchema = z.object({
  totalAccounts: z.number(),
  accountsAtRisk: z.number(),
  commonPatterns: z.array(z.string()),
  agencyLevelRecommendations: z.array(z.string()),
});
export type AgencySummary = z.infer<typeof agencySummarySchema>;
