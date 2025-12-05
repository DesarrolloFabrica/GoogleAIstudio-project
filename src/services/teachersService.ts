import type { TeacherForm, TeacherAiResult } from "../types";
import api from "./apiClient";

export async function createTeacherEvaluation(
  orgId: string,
  form: TeacherForm,
  aiResult: TeacherAiResult
) {
  const { data } = await api.post("/teachers/evaluations", {
    orgId,
    form,
    aiResult,
  });
  return data;
}
