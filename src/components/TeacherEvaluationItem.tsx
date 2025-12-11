// src/components/TeacherEvaluationItem.tsx
import React from "react";
import { TeacherEvaluationSummary } from "../types";

interface TeacherEvaluationItemProps {
  evaluation: TeacherEvaluationSummary;
  selected?: boolean;
  onClick?: () => void;

  /**
   * Estado de la decisión del coordinador que queremos mostrar en la UI.
   * Por ahora puede venir de:
   *  - local state del coordinador
   *  - o del backend (coordinatorDecisionStatus)
   */
  decisionStatus?: "PENDIENTE" | "APROBADO" | "RECHAZADO";
}

const TeacherEvaluationItem: React.FC<TeacherEvaluationItemProps> = ({
  evaluation,
  selected = false,
  onClick,
  decisionStatus,
}) => {
  const createdAt = evaluation.createdAt ? new Date(evaluation.createdAt) : null;
  const dateLabel = createdAt
    ? createdAt.toLocaleString("es-CO", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Fecha no disponible";

  const verdict = evaluation.aiFinalRecommendation || "";

  // Badge de veredicto IA
  let iaBadgeColor =
    "bg-slate-500/10 text-slate-300 border border-slate-500/30";
  if (verdict.toLowerCase().includes("no recomendar")) {
    iaBadgeColor =
      "bg-rose-500/10 text-rose-300 border border-rose-500/30";
  } else if (verdict.toLowerCase().includes("precauc")) {
    iaBadgeColor =
      "bg-amber-500/10 text-amber-300 border border-amber-500/30";
  } else if (
    verdict.toLowerCase().includes("recomendada") ||
    verdict.toLowerCase().includes("contratación recomendada") ||
    verdict.toLowerCase().includes("recomendar")
  ) {
    iaBadgeColor =
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30";
  }

  // Badge de decisión humana (coordinador)
  let decisionLabel = "Pendiente";
  let decisionColor =
    "bg-slate-600/20 text-slate-200 border border-slate-500/40";

  if (decisionStatus === "APROBADO") {
    decisionLabel = "Aprobado coordinación";
    decisionColor =
      "bg-emerald-600/15 text-emerald-300 border border-emerald-500/40";
  } else if (decisionStatus === "RECHAZADO") {
    decisionLabel = "Rechazado coordinación";
    decisionColor =
      "bg-rose-600/15 text-rose-300 border border-rose-500/40";
  }

  const Wrapper: React.ElementType = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-2xl border ${
        selected
          ? "border-emerald-500/70 bg-emerald-500/5"
          : "border-white/5 bg-[#090909] hover:border-emerald-500/40"
      } transition-colors duration-200 flex items-center justify-between gap-3`}
    >
      {/* IZQUIERDA: datos del candidato */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">
          {evaluation.candidate?.fullName ?? "Candidato sin nombre"}
        </p>
        <p className="text-[11px] text-gray-500 flex flex-wrap gap-2 items-center">
          {evaluation.candidate?.schoolNameSnapshot && (
            <span>{evaluation.candidate.schoolNameSnapshot}</span>
          )}
          {evaluation.candidate?.programNameSnapshot && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>{evaluation.candidate.programNameSnapshot}</span>
            </>
          )}
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span>{dateLabel}</span>
        </p>

        {/* badge de decisión humana (si estamos en un contexto donde importa) */}
        {decisionStatus && (
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${decisionColor}`}
          >
            {decisionLabel}
          </div>
        )}
      </div>

      {/* DERECHA: score y veredicto IA */}
      <div className="text-right space-y-1">
        <div
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${iaBadgeColor}`}
        >
          {verdict || "Sin veredicto"}
        </div>
        <p className="text-xs text-emerald-400 font-semibold">
          Score {Math.round(evaluation.aiTeachingSuitabilityScore || 0)}/100
        </p>
      </div>
    </Wrapper>
  );
};

export default TeacherEvaluationItem;
