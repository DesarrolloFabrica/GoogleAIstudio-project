import React, { useState, useCallback } from "react";
import { InterviewData, AnalysisResult } from "./types";
import { analyzeInterviewData } from "./services/geminiService";
import Header from "./components/Header";
import InterviewForm from "./components/InterviewForm";
import AnalysisResults from "./components/AnalysisResults";
import LoadingState from "./components/LoadingState";

const App: React.FC = () => {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (data: InterviewData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setInterviewData(data);

    try {
      const result = await analyzeInterviewData(data);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Error during analysis:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error desconocido durante el análisis. Por favor, revisa la consola e inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setInterviewData(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    // Fondo base (oscuro) a pantalla completa, sin limitar ancho
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans overflow-x-hidden">
      <Header />

      {/* El main ya no tiene 'container', ocupa todo el ancho */}
      <main className="w-full">
        {/* Formulario / pantalla principal */}
        {!analysisResult && !isLoading && (
          <InterviewForm onSubmit={handleFormSubmit} />
        )}

        {/* Loading centrado */}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <LoadingState />
          </div>
        )}

        {/* Error centrado */}
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

        {/* Resultados centrados, pero fondo sigue siendo de pantalla completa */}
        {analysisResult && interviewData && (
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <AnalysisResults
              result={analysisResult}
              interviewData={interviewData}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
