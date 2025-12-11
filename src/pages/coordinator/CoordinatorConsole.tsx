// src/pages/coordinator/CoordinatorConsole.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
  Filter,
  Loader2,
  Search,
  ShieldAlert,
  UserCheck,
  XCircle,
} from "lucide-react";

import {
  TeacherEvaluationSummary,
  AnalysisResult,
  InterviewData,
} from "../../types";
import {
  listTeacherEvaluations,
  getTeacherEvaluationById,
} from "../../services/teachersService";
import { generateAnalysisPdfFromData } from "../../services/pdfReport";
import TeacherEvaluationItem from "../../components/TeacherEvaluationItem";

// helper para reconstruir InterviewData desde lo que devuelve el backend
const mapFormToInterviewData = (detail: any): InterviewData => {
  const form = detail.formRawData;
  return {
    candidateName: form.candidate.fullName,
    age: form.candidate.age ? String(form.candidate.age) : "",
    school: form.candidate.schoolName,
    program: form.candidate.programName,
    careerSummary: form.candidate.careerSummary,
    previousExperience: form.candidate.teachingExperience,

    availabilityDetails: form.availability.scheduleDetails,
    acceptsCommittees: form.availability.acceptsCommittees,
    otherJobs: form.availability.otherJobsImpact,

    evaluationMethodology: form.classroomManagement.evaluationMethodology,
    failureRatePlan: form.classroomManagement.planIfHalfFail,
    apatheticStudentPlan: form.classroomManagement.handleApatheticStudent,

    aiToolsUsage: form.aiAttitude.usesAiHow,
    ethicalAiMeasures: form.aiAttitude.ethicalUseMeasures,
    aiPlagiarismPrevention: form.aiAttitude.handleAiPlagiarism,

    scenario29: form.coherenceCommitment.caseStudent2_9,
    scenarioCoverage: form.coherenceCommitment.emergencyProtocol,
    scenarioFeedback: form.coherenceCommitment.handleNegativeFeedback,
  };
};

type LocalDecision = "PENDIENTE" | "APROBADO" | "RECHAZADO";
type DecisionFilter = "ALL" | LocalDecision;

const CoordinatorConsole: React.FC = () => {
  const [evaluations, setEvaluations] = useState<TeacherEvaluationSummary[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{
    analysis: AnalysisResult;
    interview: InterviewData;
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // decisión actual del candidato seleccionado
  const [decision, setDecision] = useState<LocalDecision>("PENDIENTE");
  const [decisionComment, setDecisionComment] = useState("");

  // mapa local id -> decisión (para que la lista y los filtros funcionen visualmente)
  const [localDecisions, setLocalDecisions] = useState<
    Record<string, LocalDecision>
  >({});

  // filtro por estado de decisión
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("ALL");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTeacherEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error("Error al cargar evaluaciones (coordinador):", err);
        setError("No se pudo cargar el historial de evaluaciones.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEvaluations = useMemo(() => {
    let base = evaluations;

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((ev) => {
        const name = ev.candidate?.fullName?.toLowerCase() ?? "";
        const school = ev.candidate?.schoolNameSnapshot?.toLowerCase() ?? "";
        const program = ev.candidate?.programNameSnapshot?.toLowerCase() ?? "";
        return name.includes(q) || school.includes(q) || program.includes(q);
      });
    }

    if (decisionFilter !== "ALL") {
      base = base.filter((ev) => {
        const status =
          localDecisions[ev.id] ??
          (ev.coordinatorDecisionStatus as LocalDecision | undefined) ??
          "PENDIENTE";
        return status === decisionFilter;
      });
    }

    return base;
  }, [evaluations, search, decisionFilter, localDecisions]);

  const metrics = useMemo(() => {
    if (evaluations.length === 0) {
      return {
        total: 0,
        avgScore: 0,
      };
    }
    const total = evaluations.length;
    const sumScore = evaluations.reduce(
      (acc, ev) => acc + (ev.aiTeachingSuitabilityScore || 0),
      0
    );
    return {
      total,
      avgScore: sumScore / total,
    };
  }, [evaluations]);

  const handleSelectEvaluation = async (id: string) => {
    setSelectedId(id);
    setSelectedDetail(null);
    setLoadingDetail(true);

    const current =
      localDecisions[id] ??
      (evaluations.find((e) => e.id === id)?.coordinatorDecisionStatus as
        | LocalDecision
        | undefined) ??
      "PENDIENTE";
    setDecision(current);
    setDecisionComment("");

    try {
      const detail = await getTeacherEvaluationById(id);
      const analysis: AnalysisResult = detail.aiRawJson;
      const interview = mapFormToInterviewData(detail);

      setSelectedDetail({ analysis, interview });
    } catch (err) {
      console.error("Error al cargar detalle:", err);
      setError("No se pudo cargar el detalle de la evaluación.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedDetail || !selectedId) return;
    try {
      await generateAnalysisPdfFromData(
        selectedDetail.analysis,
        selectedDetail.interview,
        { download: true }
      );
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("No se pudo generar el PDF del reporte.");
    }
  };

  const applyDecision = (newDecision: LocalDecision) => {
    if (!selectedId) return;
    setDecision(newDecision);
    setLocalDecisions((prev) => ({
      ...prev,
      [selectedId]: newDecision,
    }));
  };

  // ---------- Render ----------

  return (
    // 👇 overflow-x-hidden para permitir scroll vertical y evitar cortes
    <div className="min-h-screen w-full bg-[#020202] text-gray-200 font-sans relative overflow-x-hidden">
      {/* blobs fondo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-[140px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "9s" }}
        />
        <div className="absolute bottom-[5%] right-[0%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-10">
        {/* HEADER */}
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
            <ShieldAlert className="w-4 h-4" />
            <span>Consola de Coordinación</span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.05]">
              Revisión y Aprobación de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Evaluaciones Docentes
              </span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
              Aquí puedes revisar los perfiles analizados por los líderes,
              abrir el detalle de cada reporte generado por IA y registrar, en
              una siguiente integración con backend, la decisión de
              contratación para cada candidato.
            </p>
          </div>
        </header>

        {/* ESTADO CARGA / ERROR */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Cargando historial de evaluaciones…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-3">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm text-center max-w-md">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* MÉTRICAS RÁPIDAS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="bg-[#050505] border border-white/10 rounded-3xl px-5 py-4 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-widest text-gray-500">
                    Evaluaciones Totales
                  </span>
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-black text-white">
                  {metrics.total}
                </p>
              </div>

              <div className="bg-[#050505] border border-white/10 rounded-3xl px-5 py-4 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-widest text-gray-500">
                    Puntaje Global Promedio
                  </span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-3xl font-black text-white">
                  {metrics.avgScore.toFixed(1)}
                  <span className="text-sm text-gray-500 ml-1">/100</span>
                </p>
              </div>

              <div className="bg-[#050505] border border-white/10 rounded-3xl px-5 py-4 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-widest text-gray-500">
                    Próxima Fase
                  </span>
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <p className="text-xs text-gray-400">
                  Esta consola será el punto único para registrar decisiones de
                  contratación con trazabilidad (quién aprueba y cuándo).
                </p>
              </div>
            </section>

            {/* LISTA + DETALLE */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LISTA IZQUIERDA */}
              <div className="bg-[#050505]/90 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Evaluaciones Registradas
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Selecciona un candidato para ver el informe completo.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Historial guardado en backend</span>
                  </div>
                </div>

                {/* buscador + filtro decisión */}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, programa, escuela..."
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl border border-white/10 text-[11px] uppercase tracking-widest text-gray-500 flex items-center gap-1 cursor-default"
                    >
                      <Filter className="w-3 h-3" />
                      <span>Filtros</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="uppercase tracking-widest text-gray-500">
                      Estado:
                    </span>
                    {(
                      ["ALL", "PENDIENTE", "APROBADO", "RECHAZADO"] as DecisionFilter[]
                    ).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDecisionFilter(opt)}
                        className={`px-3 py-1 rounded-full border text-[11px] ${
                          decisionFilter === opt
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 text-gray-400 hover:border-emerald-500/40"
                        }`}
                      >
                        {opt === "ALL" ? "Todos" : opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* lista */}
                <div className="space-y-2 overflow-y-auto pr-1 max-h-[480px]">
                  {filteredEvaluations.length === 0 && (
                    <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
                      No hay evaluaciones para los filtros actuales.
                    </div>
                  )}

                  {filteredEvaluations.map((ev) => {
                    const isSelected = selectedId === ev.id;
                    const statusForUi =
                      localDecisions[ev.id] ??
                      (ev.coordinatorDecisionStatus as
                        | LocalDecision
                        | undefined);

                    return (
                      <TeacherEvaluationItem
                        key={ev.id}
                        evaluation={ev}
                        selected={isSelected}
                        onClick={() => handleSelectEvaluation(ev.id)}
                        decisionStatus={statusForUi}
                      />
                    );
                  })}
                </div>
              </div>

              {/* PANEL DERECHO: DETALLE + DECISIÓN */}
              <div className="bg-[#050505]/90 border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                      Detalle de Evaluación Seleccionada
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Ver informe IA y prototipar la decisión de contratación.
                    </p>
                  </div>

                  {selectedDetail && (
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Exportar PDF
                    </button>
                  )}
                </div>

                {loadingDetail && (
                  <div className="flex flex-1 items-center justify-center text-gray-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">
                      Cargando informe de la evaluación…
                    </span>
                  </div>
                )}

                {!loadingDetail && !selectedDetail && (
                  <div className="flex flex-1 flex-col items-center justify-center text-gray-500 gap-3">
                    <Search className="w-8 h-8" />
                    <p className="text-sm text-center max-w-sm">
                      Selecciona una evaluación en el panel izquierdo para ver
                      el informe completo generado por IA.
                    </p>
                  </div>
                )}

                {selectedDetail && !loadingDetail && (
                  // 👇 sin flex-1 ni overflow interno → que crezca y la página haga scroll
                  <div className="mt-2 space-y-5">
                    {/* Bloque de decisión */}
                    <div className="bg-[#090909] border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-gray-500">
                            Decisión del Coordinador (prototipo)
                          </p>
                          <p className="text-sm text-gray-300">
                            Esta decisión aún no se guarda en backend; solo
                            define la UX. Luego la conectamos a la API y
                            trazabilidad completa.
                          </p>
                        </div>
                        <div>
                          {decision === "PENDIENTE" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-600/20 text-slate-200 text-[11px] font-bold uppercase tracking-widest">
                              Pendiente
                            </span>
                          )}
                          {decision === "APROBADO" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Aprobado
                            </span>
                          )}
                          {decision === "RECHAZADO" && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-600/20 text-rose-300 text-[11px] font-bold uppercase tracking-widest">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rechazado
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => applyDecision("APROBADO")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                            decision === "APROBADO"
                              ? "bg-emerald-600 text-white"
                              : "bg-[#111] text-gray-300 hover:bg-emerald-600/10 hover:text-emerald-300"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Aprobar candidato
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDecision("RECHAZADO")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                            decision === "RECHAZADO"
                              ? "bg-rose-600 text-white"
                              : "bg-[#111] text-gray-300 hover:bg-rose-600/10 hover:text-rose-300"
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar candidato
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-widest text-gray-500">
                          Comentario del coordinador
                        </label>
                        <textarea
                          value={decisionComment}
                          onChange={(e) => setDecisionComment(e.target.value)}
                          rows={3}
                          placeholder="Ej. Se recomienda perfilar para curso corto, no para nombramiento de planta..."
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500/50 resize-none"
                        />
                      </div>

                      <p className="text-[11px] text-gray-500">
                        En la siguiente iteración, este bloque enviará la
                        decisión a un endpoint tipo{" "}
                        <code className="bg-black/40 px-1 rounded">
                          POST /teachers/evaluations/:id/decision
                        </code>{" "}
                        y se reflejará de forma persistente en los tableros.
                      </p>
                    </div>

                    {/* Resumen IA rápido (score / riesgo) */}
                    <div className="bg-[#090909] border border-white/10 rounded-2xl p-4 space-y-4">
                      <p className="text-[11px] uppercase tracking-widest text-gray-500">
                        Resumen IA
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Score global */}
                        <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3 flex flex-col justify-between">
                          <span className="text-[10px] uppercase tracking-widest text-gray-500">
                            Score Global
                          </span>
                          <p className="mt-1 text-2xl font-bold text-emerald-400 leading-none">
                            {selectedDetail.analysis.overallScore.toFixed(1)}
                            <span className="text-sm text-gray-500 ml-1">
                              /100
                            </span>
                          </p>
                        </div>

                        {/* Nivel de riesgo */}
                        <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3 flex flex-col justify-between">
                          <span className="text-[10px] uppercase tracking-widest text-gray-500">
                            Nivel de riesgo
                          </span>
                          <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800 text-gray-100 text-[11px] font-semibold">
                            {selectedDetail.analysis.overallRiskLevel}
                          </span>
                        </div>

                        {/* Veredicto IA */}
                        <div className="bg-[#050505] border border-white/10 rounded-xl px-3 py-3 flex flex-col justify-between">
                          <span className="text-[10px] uppercase tracking-widest text-gray-500">
                            Veredicto IA
                          </span>
                          <span className="mt-2 text-xs font-semibold text-gray-200">
                            {selectedDetail.analysis.finalVerdict}
                          </span>
                        </div>
                      </div>

                      <div className="h-px bg-white/10" />

                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-widest text-gray-500">
                          Resumen ejecutivo
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {selectedDetail.analysis.executiveSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default CoordinatorConsole;
