import React, { useState, useCallback } from "react";
import {
  InterviewData,
  AnalysisResult,
  TeacherForm,
  TeacherAiResult,
} from "./types";

import { analyzeTeacherInterview } from "./services/geminiService";
import { createTeacherEvaluation } from "./services/teachersService";

import Header from "./components/Header";
import InterviewForm from "./components/InterviewForm";
import AnalysisResults from "./components/AnalysisResults";
import LoadingState from "./components/LoadingState";

const ORG_ID = import.meta.env.VITE_ORG_ID ?? "ORG_DEFAULT";

const mapToTeacherForm = (data: InterviewData): TeacherForm => ({
  candidate: {
    fullName: data.candidateName,
    age: Number(data.age) || 0,
    schoolName: data.school,
    programName: data.program,
    careerSummary: data.careerSummary,
    teachingExperience: data.previousExperience,
  },
  availability: {
    scheduleDetails: data.availabilityDetails,
    acceptsCommittees: data.acceptsCommittees,
    otherJobsImpact: data.otherJobs,
  },
  classroomManagement: {
    evaluationMethodology: data.evaluationMethodology,
    planIfHalfFail: data.failureRatePlan,
    handleApatheticStudent: data.apatheticStudentPlan,
  },
  aiAttitude: {
    usesAiHow: data.aiToolsUsage,
    ethicalUseMeasures: data.ethicalAiMeasures,
    handleAiPlagiarism: data.aiPlagiarismPrevention,
  },
  coherenceCommitment: {
    caseStudent2_9: data.scenario29,
    emergencyProtocol: data.scenarioCoverage,
    handleNegativeFeedback: data.scenarioFeedback,
  },
});

const App: React.FC = () => {
  const [interviewData, setInterviewData] =
    useState<InterviewData | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(
    async (data: InterviewData) => {
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      setInterviewData(data);
      setEvaluationId(null);

      try {
        // 1) IA: análisis con Gemini
        const aiResult: TeacherAiResult = await analyzeTeacherInterview(data);

        // Seguimos usando el JSON completo para los gráficos
        if (aiResult.rawOutput) {
          setAnalysisResult(aiResult.rawOutput);
        }

        // 2) DTO para backend
        const form = mapToTeacherForm(data);

        // 3) Guardar evaluación en el backend y obtener el id
        const { id } = await createTeacherEvaluation(ORG_ID, form, aiResult);
        setEvaluationId(id);
      } catch (err) {
        console.error("Error during analysis or save:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error durante el análisis o guardado. Revisa la consola."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    setInterviewData(null);
    setAnalysisResult(null);
    setEvaluationId(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans overflow-x-hidden">
      <Header />

      <main className="w-full">
        {!analysisResult && !isLoading && (
          <InterviewForm onSubmit={handleFormSubmit} />
        )}

        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <LoadingState />
          </div>
        )}

        {error && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center p-8">
            <div
              className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative"
              role="alert"
            >
              <strong className="font-bold">¡Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
            <button
              onClick={handleReset}
              className="mt-6 bg-[#007BFF] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#0056D2] transition-colors duration-300"
            >
              Comenzar de Nuevo
            </button>
          </div>
        )}

        {analysisResult && interviewData && (
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <AnalysisResults
              result={analysisResult}
              interviewData={interviewData}
              onReset={handleReset}
              evaluationId={evaluationId ?? undefined}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
