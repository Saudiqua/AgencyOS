import type { AccountInput, AnalysisResult, SignalLevel } from "@shared/schema";
import { randomUUID } from "crypto";

type SignalResult = {
  level: SignalLevel;
  score: number;
  explanation: string;
  factors: string[];
  recommendations: string[];
};

export function evaluateRetainerReality(input: AccountInput["retainerReality"]): SignalResult {
  let score = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  const hoursRatio = input.scopedHoursPerMonth > 0
    ? input.actualHoursDelivered / input.scopedHoursPerMonth
    : 1;

  if (hoursRatio > 1.3) {
    score += 30;
    factors.push(`Actual hours exceed scoped hours by ${Math.round((hoursRatio - 1) * 100)}%`);
    recommendations.push("Review scope documentation and consider formal change request process");
  } else if (hoursRatio > 1.15) {
    score += 15;
    factors.push("Moderate overdelivery pattern detected");
  }

  const seniorScores: Record<string, number> = {
    rarely: 0,
    occasionally: 10,
    frequently: 25,
    constantly: 40,
  };
  score += seniorScores[input.seniorInvolvementFrequency];

  if (input.seniorInvolvementFrequency === "frequently" || input.seniorInvolvementFrequency === "constantly") {
    factors.push("Senior staff involvement exceeds strategic oversight level");
    recommendations.push("Evaluate team capability gaps or scope complexity mismatch");
  }

  if (input.scopeChangeRequests > 5) {
    score += 25;
    factors.push(`${input.scopeChangeRequests} scope changes in last quarter indicates fluid requirements`);
    recommendations.push("Implement quarterly scope review sessions with client");
  } else if (input.scopeChangeRequests > 2) {
    score += 10;
    factors.push("Moderate scope change frequency");
  }

  if (input.exceptionHandlingNormalized) {
    score += 20;
    factors.push("Exception handling has become normalized delivery pattern");
    recommendations.push("Formalize out-of-scope request process with clear boundaries");
  }

  let level: SignalLevel;
  if (score >= 60) level = "high";
  else if (score >= 40) level = "elevated";
  else if (score >= 20) level = "moderate";
  else level = "low";

  const explanations: Record<SignalLevel, string> = {
    low: "Commercial structure appears well-aligned with delivery reality. Scoping is appropriate and exceptions are managed effectively.",
    moderate: "Some misalignment detected between retainer scope and actual delivery. Worth monitoring but not immediately concerning.",
    elevated: "Significant gap between commercial terms and delivery reality. Structural review recommended within the next quarter.",
    high: "Critical misalignment between retainer and delivery. This account may be operating at a loss or unsustainable margin. Immediate review recommended.",
  };

  return {
    level,
    score: Math.min(score, 100),
    explanation: explanations[level],
    factors,
    recommendations,
  };
}

export function evaluateDeliveryDrift(input: AccountInput["deliveryDrift"]): SignalResult {
  let score = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  if (input.plannedVsReactiveRatio < 50) {
    score += 35;
    factors.push(`Only ${input.plannedVsReactiveRatio}% of time on planned work indicates reactive mode`);
    recommendations.push("Implement buffer time in planning and review request prioritization");
  } else if (input.plannedVsReactiveRatio < 70) {
    score += 20;
    factors.push("Reactive work consuming significant portion of capacity");
  }

  if (input.lastMinuteRequestsPerWeek > 5) {
    score += 25;
    factors.push(`${input.lastMinuteRequestsPerWeek} last-minute requests weekly disrupts delivery rhythm`);
    recommendations.push("Establish clear request SLAs with client stakeholder");
  } else if (input.lastMinuteRequestsPerWeek > 2) {
    score += 10;
    factors.push("Regular last-minute requests affecting planning");
  }

  if (input.missedDeadlinesLast3Months > 3) {
    score += 25;
    factors.push(`${input.missedDeadlinesLast3Months} missed deadlines suggests capacity or planning issues`);
    recommendations.push("Review estimation practices and capacity allocation");
  } else if (input.missedDeadlinesLast3Months > 1) {
    score += 10;
    factors.push("Some internal deadline slippage noted");
  }

  const overtimeScores: Record<string, number> = {
    none: 0,
    occasional: 5,
    regular: 20,
    constant: 35,
  };
  score += overtimeScores[input.teamOvertime];

  if (input.teamOvertime === "regular" || input.teamOvertime === "constant") {
    factors.push("Team overtime pattern indicates sustained capacity pressure");
    recommendations.push("Assess workload distribution and resource allocation");
  }

  const processScores: Record<string, number> = {
    strong: 0,
    moderate: 5,
    weak: 15,
    absent: 25,
  };
  score += processScores[input.processAdherenceLevel];

  if (input.processAdherenceLevel === "weak" || input.processAdherenceLevel === "absent") {
    factors.push("Process discipline has eroded, increasing risk of errors and rework");
    recommendations.push("Reinforce core delivery processes before they degrade further");
  }

  let level: SignalLevel;
  if (score >= 60) level = "high";
  else if (score >= 40) level = "elevated";
  else if (score >= 20) level = "moderate";
  else level = "low";

  const explanations: Record<SignalLevel, string> = {
    low: "Delivery remains largely planned and proactive. The team is operating with healthy capacity and process discipline.",
    moderate: "Some drift toward reactive delivery patterns. Not yet critical but worth addressing before it becomes structural.",
    elevated: "Significant delivery drift detected. The account has moved from planned delivery into firefighting mode. Intervention recommended.",
    high: "Delivery has shifted predominantly to reactive mode. This pattern is unsustainable and risks team burnout and quality issues. Immediate action required.",
  };

  return {
    level,
    score: Math.min(score, 100),
    explanation: explanations[level],
    factors,
    recommendations,
  };
}

export function evaluateClientRisk(input: AccountInput["clientRisk"]): SignalResult {
  let score = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  const accessScores: Record<string, number> = {
    excellent: 0,
    good: 5,
    limited: 20,
    poor: 35,
  };
  score += accessScores[input.stakeholderAccessibility];

  if (input.stakeholderAccessibility === "limited" || input.stakeholderAccessibility === "poor") {
    factors.push("Limited stakeholder access creates decision bottlenecks and misalignment risk");
    recommendations.push("Request regular check-in cadence or escalation path clarification");
  }

  const feedbackScores: Record<string, number> = {
    positive: 0,
    neutral: 5,
    mixed: 20,
    negative: 40,
  };
  score += feedbackScores[input.feedbackTone];

  if (input.feedbackTone === "mixed") {
    factors.push("Mixed feedback signals potential dissatisfaction that hasn't crystallized");
    recommendations.push("Schedule candid relationship review to surface underlying concerns");
  } else if (input.feedbackTone === "negative") {
    factors.push("Negative feedback pattern indicates relationship stress");
    recommendations.push("Prioritize relationship repair and expectation realignment");
  }

  const responseScores: Record<string, number> = {
    fast: 0,
    normal: 0,
    slow: 10,
    very_slow: 20,
  };
  score += responseScores[input.responseTimeToRequests];

  if (input.responseTimeToRequests === "slow" || input.responseTimeToRequests === "very_slow") {
    factors.push("Slow client response times may indicate disengagement or internal issues");
  }

  const creepScores: Record<string, number> = {
    none: 0,
    occasional: 5,
    frequent: 15,
    constant: 25,
  };
  score += creepScores[input.scopeCreepBehaviour];

  if (input.scopeCreepBehaviour === "frequent" || input.scopeCreepBehaviour === "constant") {
    factors.push("Persistent scope creep suggests unclear boundaries or unrealistic expectations");
    recommendations.push("Clarify scope boundaries in writing and implement change request process");
  }

  const paymentScores: Record<string, number> = {
    early: 0,
    on_time: 0,
    delayed: 15,
    very_delayed: 30,
  };
  score += paymentScores[input.paymentBehaviour];

  if (input.paymentBehaviour === "delayed" || input.paymentBehaviour === "very_delayed") {
    factors.push("Payment delays may indicate budget issues or relationship problems");
    recommendations.push("Address payment terms directly and assess client financial stability");
  }

  if (input.recentEscalations > 2) {
    score += 25;
    factors.push(`${input.recentEscalations} recent escalations indicates relationship instability`);
    recommendations.push("Conduct relationship review and address root causes of escalations");
  } else if (input.recentEscalations > 0) {
    score += 10;
    factors.push("Some escalation activity in recent period");
  }

  let level: SignalLevel;
  if (score >= 60) level = "high";
  else if (score >= 40) level = "elevated";
  else if (score >= 20) level = "moderate";
  else level = "low";

  const explanations: Record<SignalLevel, string> = {
    low: "Client relationship appears healthy and stable. Good engagement, clear communication, and appropriate boundaries in place.",
    moderate: "Some relationship friction points detected. Worth addressing proactively to prevent escalation.",
    elevated: "Multiple risk indicators present. This relationship requires attention to prevent deterioration or potential churn.",
    high: "Significant client risk identified. This account shows multiple warning signs that require immediate leadership attention.",
  };

  return {
    level,
    score: Math.min(score, 100),
    explanation: explanations[level],
    factors,
    recommendations,
  };
}

export function generateOverallAssessment(
  retainer: SignalResult,
  drift: SignalResult,
  client: SignalResult
): {
  level: SignalLevel;
  summary: string;
  keyFindings: string[];
  priorityActions: string[];
} {
  const levelScores: Record<SignalLevel, number> = {
    low: 0,
    moderate: 1,
    elevated: 2,
    high: 3,
  };

  const avgScore = (levelScores[retainer.level] + levelScores[drift.level] + levelScores[client.level]) / 3;
  const highSignals = [retainer.level, drift.level, client.level].filter(l => l === "high").length;
  const elevatedSignals = [retainer.level, drift.level, client.level].filter(l => l === "elevated").length;

  let level: SignalLevel;
  if (highSignals >= 2 || avgScore >= 2.5) {
    level = "high";
  } else if (highSignals >= 1 || elevatedSignals >= 2 || avgScore >= 1.5) {
    level = "elevated";
  } else if (elevatedSignals >= 1 || avgScore >= 0.5) {
    level = "moderate";
  } else {
    level = "low";
  }

  const keyFindings: string[] = [];
  const priorityActions: string[] = [];

  if (retainer.level !== "low") {
    keyFindings.push(...retainer.factors.slice(0, 2));
    priorityActions.push(...retainer.recommendations.slice(0, 1));
  }
  if (drift.level !== "low") {
    keyFindings.push(...drift.factors.slice(0, 2));
    priorityActions.push(...drift.recommendations.slice(0, 1));
  }
  if (client.level !== "low") {
    keyFindings.push(...client.factors.slice(0, 2));
    priorityActions.push(...client.recommendations.slice(0, 1));
  }

  const summaries: Record<SignalLevel, string> = {
    low: "This account shows healthy operational patterns across all three signal dimensions. No immediate concerns require attention, though maintaining regular monitoring is advisable.",
    moderate: "This account shows some areas of concern that merit attention. While not immediately critical, addressing these patterns now will prevent them from becoming structural issues.",
    elevated: "This account displays significant operational stress across multiple dimensions. Leadership attention is recommended to address underlying issues before they escalate.",
    high: "This account requires immediate attention. Multiple high-risk signals indicate potential for relationship breakdown, team burnout, or financial loss if not addressed urgently.",
  };

  return {
    level,
    summary: summaries[level],
    keyFindings: keyFindings.slice(0, 5),
    priorityActions: priorityActions.slice(0, 3),
  };
}

export function generateMarkdownReport(
  input: AccountInput,
  retainer: SignalResult,
  drift: SignalResult,
  client: SignalResult,
  overall: ReturnType<typeof generateOverallAssessment>,
  date: string
): string {
  const levelLabels: Record<SignalLevel, string> = {
    low: "Low",
    moderate: "Moderate",
    elevated: "Elevated",
    high: "High",
  };

  let md = `# Account Diagnostic Report: ${input.accountName}\n\n`;
  md += `**Analysis Date:** ${new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n\n`;

  if (input.clientIndustry) {
    md += `**Industry:** ${input.clientIndustry}\n`;
  }
  md += `**Account Tenure:** ${input.accountTenure}\n`;
  md += `**Team Size:** ${input.teamSize} people\n\n`;

  md += `---\n\n`;
  md += `## Overall Assessment: ${levelLabels[overall.level]}\n\n`;
  md += `${overall.summary}\n\n`;

  if (overall.keyFindings.length > 0) {
    md += `### Key Findings\n\n`;
    overall.keyFindings.forEach(finding => {
      md += `- ${finding}\n`;
    });
    md += `\n`;
  }

  if (overall.priorityActions.length > 0) {
    md += `### Priority Actions\n\n`;
    overall.priorityActions.forEach((action, index) => {
      md += `${index + 1}. ${action}\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## Signal Analysis\n\n`;

  md += `### Retainer Reality Index: ${levelLabels[retainer.level]}\n\n`;
  md += `${retainer.explanation}\n\n`;
  if (retainer.factors.length > 0) {
    md += `**Contributing Factors:**\n`;
    retainer.factors.forEach(factor => {
      md += `- ${factor}\n`;
    });
    md += `\n`;
  }
  if (retainer.recommendations.length > 0) {
    md += `**Recommendations:**\n`;
    retainer.recommendations.forEach(rec => {
      md += `- ${rec}\n`;
    });
    md += `\n`;
  }

  md += `### Delivery Drift Signal: ${levelLabels[drift.level]}\n\n`;
  md += `${drift.explanation}\n\n`;
  if (drift.factors.length > 0) {
    md += `**Contributing Factors:**\n`;
    drift.factors.forEach(factor => {
      md += `- ${factor}\n`;
    });
    md += `\n`;
  }
  if (drift.recommendations.length > 0) {
    md += `**Recommendations:**\n`;
    drift.recommendations.forEach(rec => {
      md += `- ${rec}\n`;
    });
    md += `\n`;
  }

  md += `### Client Risk Signal: ${levelLabels[client.level]}\n\n`;
  md += `${client.explanation}\n\n`;
  if (client.factors.length > 0) {
    md += `**Contributing Factors:**\n`;
    client.factors.forEach(factor => {
      md += `- ${factor}\n`;
    });
    md += `\n`;
  }
  if (client.recommendations.length > 0) {
    md += `**Recommendations:**\n`;
    client.recommendations.forEach(rec => {
      md += `- ${rec}\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;
  md += `*This diagnostic report was generated by AgencyOS Signals. It represents a point-in-time assessment based on the data provided and should be used alongside professional judgment and direct client knowledge.*\n`;

  return md;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createAnalysis(input: AccountInput): AnalysisResult {
  const id = generateUUID();
  const analysisDate = new Date().toISOString();

  const retainerSignal = evaluateRetainerReality(input.retainerReality);
  const driftSignal = evaluateDeliveryDrift(input.deliveryDrift);
  const clientSignal = evaluateClientRisk(input.clientRisk);
  const overall = generateOverallAssessment(retainerSignal, driftSignal, clientSignal);

  const markdownReport = generateMarkdownReport(
    input,
    retainerSignal,
    driftSignal,
    clientSignal,
    overall,
    analysisDate
  );

  return {
    id,
    accountName: input.accountName,
    analysisDate,
    retainerRealitySignal: retainerSignal,
    deliveryDriftSignal: driftSignal,
    clientRiskSignal: clientSignal,
    overallAssessment: overall,
    markdownReport,
  };
}
