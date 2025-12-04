import { GoogleGenAI, Type } from "@google/genai";
import { InterviewData, AnalysisResult } from "../types";

// Per guidelines, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallRiskLevel: {
      type: Type.STRING,
      description:
        "Nivel de riesgo general del candidato ('Bajo', 'Medio', 'Alto').",
      enum: ["Bajo", "Medio", "Alto"],
    },
    overallScore: {
      type: Type.NUMBER,
      description:
        "Puntaje numérico global del 0 al 100, donde 100 es el mejor.",
    },
    executiveSummary: {
      type: Type.STRING,
      description:
        "Resumen ejecutivo conciso del perfil del candidato, sus fortalezas y debilidades clave.",
    },
    categoryAnalyses: {
      type: Type.ARRAY,
      description: "Análisis detallado por cada una de las cuatro categorías.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description:
              "Nombre de la categoría analizada (ej: 'Disponibilidad y Condiciones', 'Manejo de Aula', 'Actitud Frente a la IA', 'Coherencia y Compromiso').",
          },
          score: {
            type: Type.NUMBER,
            description: "Puntaje de 0 a 100 para esta categoría.",
          },
          reporteAnalitico: {
            type: Type.STRING,
            description:
              "Reporte detallado que justifica el puntaje. Debe incluir un análisis comparativo con datos o estadísticas simuladas para dar contexto. Por ejemplo: 'Su plan de acción ante la reprobación es un 30% más estructurado que el promedio de los candidatos'.",
          },
          oportunidades: {
            type: Type.STRING,
            description:
              "Describe las principales fortalezas u oportunidades que el candidato presenta en esta área.",
          },
          recomendaciones: {
            type: Type.STRING,
            description:
              "Proporciona una recomendación específica para validar o mejorar en esta categoría.",
          },
          observacionesCorregidas: {
            type: Type.STRING,
            description:
              "El texto original del usuario para esta categoría, pero corregido gramaticalmente y ortográficamente para mayor claridad y profesionalismo. Resume las ideas principales.",
          },
        },
        required: [
          "category",
          "score",
          "reporteAnalitico",
          "oportunidades",
          "recomendaciones",
          "observacionesCorregidas",
        ],
      },
    },
    mitigationRecommendations: {
      type: Type.ARRAY,
      description:
        "Lista de recomendaciones generales para mitigar los riesgos identificados. Si el riesgo es Bajo, puede estar vacío.",
      items: { type: Type.STRING },
    },
    resignationRiskWindow: {
      type: Type.STRING,
      description:
        "Ventana de tiempo estimada en la que el candidato podría renunciar, basada en patrones históricos. Ejemplos: 'Días 1-5 (Inicio de clases)', 'Días 10-20 (Cierre de primer corte)'.",
    },
    temporalRiskFactors: {
      type: Type.ARRAY,
      description:
        "Lista de los factores de riesgo específicos que justifican la ventana de renuncia estimada.",
      items: { type: Type.STRING },
    },
    finalVerdict: {
      type: Type.STRING,
      description:
        "Veredicto final: una recomendación clara sobre si proceder con la contratación ('Contratación Recomendada', 'Contratar con Precaución', 'No Recomendar Contratación').",
    },
  },
  required: [
    "overallRiskLevel",
    "overallScore",
    "executiveSummary",
    "categoryAnalyses",
    "mitigationRecommendations",
    "resignationRiskWindow",
    "temporalRiskFactors",
    "finalVerdict",
  ],
};

function buildPrompt(data: InterviewData): string {
  return `
    Eres un experto en reclutamiento y selección de personal académico para una institución de educación superior. Tu tarea es analizar la siguiente transcripción de una entrevista a un candidato a facilitador y evaluar su idoneidad, identificando fortalezas, debilidades y riesgos potenciales de manera cuantitativa y cualitativa.

    **Contexto:**
    La institución valora la coherencia, el compromiso, el manejo pedagógico sólido, la adaptabilidad a la tecnología (IA) y el cumplimiento de políticas institucionales.

    **Información del Candidato:**
    - Nombre: ${data.candidateName}
    - Edad: ${data.age}
    - Escuela/Coordinación: ${data.school}
    - Programa Académico: ${data.program}
    - Resumen de Carrera: ${data.careerSummary}
    - Experiencia Docente Previa: ${data.previousExperience}

    **Observaciones del Entrevistador:**

    **1. Sobre Disponibilidad y Condiciones:**
    - Disponibilidad: ${data.availabilityDetails}
    - Aceptación de comités: ${data.acceptsCommittees}
    - Otros empleos: ${data.otherJobs}

    **2. Sobre Manejo de Aula:**
    - Metodología de evaluación: ${data.evaluationMethodology}
    - Plan ante reprobación: ${data.failureRatePlan}
    - Enfoque con estudiantes apáticos: ${data.apatheticStudentPlan}

    **3. Sobre Actitud Frente a la IA:**
    - Uso de herramientas IA: ${data.aiToolsUsage}
    - Medidas de uso ético: ${data.ethicalAiMeasures}
    - Prevención de plagio con IA: ${data.aiPlagiarismPrevention}

    **4. Sobre Coherencia y Compromiso (Escenarios):**
    - Decisión sobre '2.9': ${data.scenario29}
    - Protocolo de cobertura: ${data.scenarioCoverage}
    - Plan ante feedback negativo: ${data.scenarioFeedback}

    **Instrucciones de Análisis:**
    1.  **Evalúa cada una de las 4 categorías** asignando un puntaje de 0 a 100.
    2.  Para cada categoría, escribe un **Reporte Analítico** que justifique el puntaje, incluyendo un análisis comparativo con estadísticas simuladas para dar contexto.
    3.  Para cada categoría, identifica **Oportunidades** y **Recomendaciones**.
    4.  **IMPORTANTE: Para cada categoría, toma las observaciones del entrevistador correspondientes, corrige cualquier error de ortografía y gramática, mejora la redacción para que sea clara y profesional, y devuelve este texto consolidado y pulido en el campo 'observacionesCorregidas'.**
    5.  **Calcula un puntaje global** ponderando las categorías: Manejo de Aula (35%), Coherencia y Compromiso (30%), Actitud Frente a la IA (20%), Disponibilidad y Condiciones (15%).
    6.  **Determina un nivel de riesgo general** (Bajo, Medio, Alto).
    7.  **Escribe un resumen ejecutivo**.
    8.  **Proporciona recomendaciones de mitigación** generales.
    9.  **Emite un veredicto final** claro.
    10. **Proyecta una ventana temporal de renuncia.** Basándote en los siguientes patrones históricos, estima el período más probable en que el candidato podría renunciar si fuera contratado. Justifica tu estimación con los factores de riesgo específicos detectados.
        - **Renuncia Temprana (Días 1-5):** Generalmente causada por incompatibilidad de horarios, conflictos con otro empleo, o rechazo a condiciones contractuales clave (comités, etc.).
        - **Renuncia Media (Días 5-10):** A menudo relacionada con falta de recursos, problemas de conectividad (para modalidad virtual), o dificultades iniciales de adaptación a la carga de trabajo.
        - **Renuncia Tardía (Días 10-20):** Típicamente surge por sobrecarga laboral, conflictos con el feedback recibido, o problemas graves en el manejo de aula.

    **Formato de Salida:**
    Debes devolver tu análisis estrictamente en formato JSON, siguiendo el esquema proporcionado. No incluyas texto o explicaciones fuera del JSON.
  `;
}

export const analyzeInterviewData = async (
  data: InterviewData
): Promise<AnalysisResult> => {
  const prompt = buildPrompt(data);

  try {
    // Use gemini-2.5-pro for complex reasoning and set max thinking budget
    const model = "gemini-2.5-pro";

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
        // Per user request, enable thinking mode for complex queries
        thinkingConfig: {
          thinkingBudget: 32768,
        },
      },
    });

    const jsonText = response.text;

    if (!jsonText) {
      throw new Error("La respuesta de la IA estaba vacía.");
    }

    // Validate that all required fields are present, especially the new one
    const result: AnalysisResult = JSON.parse(jsonText);
    if (!result.categoryAnalyses.every((c) => "observacionesCorregidas" in c)) {
      console.warn(
        "La respuesta de la IA no incluyó 'observacionesCorregidas' en todas las categorías."
      );
    }

    return result;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    if (error instanceof Error && error.message.includes("SAFETY")) {
      throw new Error(
        "La solicitud fue bloqueada por políticas de seguridad. Revisa el contenido de las respuestas."
      );
    }
    throw new Error(
      "No se pudo completar el análisis. Inténtalo de nuevo más tarde."
    );
  }
};
