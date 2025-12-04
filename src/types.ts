// Fix: The original content of this file was incorrect, containing example data and a circular import.
// It has been replaced with the correct type definitions to be used across the application.

export interface InterviewData {
  candidateName: string;
  age: string;
  school: string;
  program: string;
  careerSummary: string;
  previousExperience: string;
  availabilityDetails: string;
  acceptsCommittees: 'Sí' | 'No' | 'Depende';
  otherJobs: string;
  evaluationMethodology: string;
  failureRatePlan: string;
  apatheticStudentPlan: string;
  aiToolsUsage: string;
  ethicalAiMeasures: string;
  aiPlagiarismPrevention: string;
  scenario29: string;
  scenarioCoverage: string;
  scenarioFeedback: string;
}

export interface CategoryAnalysis {
  category: string;
  score: number;
  reporteAnalitico: string;
  oportunidades: string;
  recomendaciones: string;
  observacionesCorregidas: string;
}

export interface AnalysisResult {
  overallRiskLevel: 'Bajo' | 'Medio' | 'Alto';
  overallScore: number;
  executiveSummary: string;
  categoryAnalyses: CategoryAnalysis[];
  mitigationRecommendations: string[];
  resignationRiskWindow: string;
  temporalRiskFactors: string[];
  finalVerdict: string;
}