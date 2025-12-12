// src/pages/admin/AdminConsole.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Building2,
  FileText,
  Filter,
  Loader2,
  Search,
  TrendingUp,
  Users,
  LayoutDashboard,
} from "lucide-react";

import { TeacherEvaluationSummary } from "../../types";
import { listTeacherEvaluations } from "../../services/teachersService";
import TeacherEvaluationItem from "../../components/TeacherEvaluationItem";

type RiskBucket = "RECOMENDADA" | "PRECAUCION" | "NO_RECOMENDAR" | "DESCONOCIDO";

interface AdminMetrics {
  total: number;
  avgScore: number;
  recommended: number;
  caution: number;
  notRecommended: number;
}

interface SchoolSummary {
  schoolName: string;
  total: number;
  avgScore: number;
  recommended: number;
  notRecommended: number;
}

const AdminConsole: React.FC = () => {
  const [evaluations, setEvaluations] = useState<TeacherEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("TODAS");

  // --- carga inicial ---
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTeacherEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error("Error al cargar evaluaciones (admin):", err);
        setError(
          "No se pudo cargar la información global de evaluaciones. Intenta de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // --- helpers de clasificación por veredicto ---
  const getBucket = (veredict: string | undefined | null): RiskBucket => {
    if (!veredict) return "DESCONOCIDO";
    const v = veredict.toLowerCase();
    if (v.includes("no recomendar")) return "NO_RECOMENDAR";
    if (v.includes("precauc")) return "PRECAUCION";
    if (v.includes("recomendar") || v.includes("recomendada")) return "RECOMENDADA";
    return "DESCONOCIDO";
  };

  // --- lista de escuelas únicas ---
  const schoolOptions = useMemo(() => {
    const set = new Set<string>();
    evaluations.forEach((ev) => {
      const name = ev.candidate?.schoolNameSnapshot;
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [evaluations]);

  // --- filtros globales ---
  const filteredEvaluations = useMemo(() => {
    let base = evaluations;

    if (selectedSchool !== "TODAS") {
      base = base.filter(
        (ev) => ev.candidate?.schoolNameSnapshot === selectedSchool
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((ev) => {
        const name = ev.candidate?.fullName?.toLowerCase() ?? "";
        const school = ev.candidate?.schoolNameSnapshot?.toLowerCase() ?? "";
        const program = ev.candidate?.programNameSnapshot?.toLowerCase() ?? "";
        return name.includes(q) || school.includes(q) || program.includes(q);
      });
    }

    // ordenamos por fecha desc
    return [...base].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [evaluations, search, selectedSchool]);

  // --- métricas globales ---
  const metrics: AdminMetrics = useMemo(() => {
    if (evaluations.length === 0) {
      return { total: 0, avgScore: 0, recommended: 0, caution: 0, notRecommended: 0 };
    }

    let total = evaluations.length;
    let sumScore = 0;
    let recommended = 0;
    let caution = 0;
    let notRecommended = 0;

    evaluations.forEach((ev) => {
      sumScore += ev.aiTeachingSuitabilityScore || 0;
      const bucket = getBucket(ev.aiFinalRecommendation);
      if (bucket === "RECOMENDADA") recommended += 1;
      if (bucket === "PRECAUCION") caution += 1;
      if (bucket === "NO_RECOMENDAR") notRecommended += 1;
    });

    return {
      total,
      avgScore: sumScore / total,
      recommended,
      caution,
      notRecommended,
    };
  }, [evaluations]);

  // --- resumen por escuela ---
  const schoolsSummary: SchoolSummary[] = useMemo(() => {
    const map = new Map<string, SchoolSummary>();

    evaluations.forEach((ev) => {
      const key = ev.candidate?.schoolNameSnapshot ?? "Sin escuela";
      const current = map.get(key) ?? {
        schoolName: key,
        total: 0,
        avgScore: 0,
        recommended: 0,
        notRecommended: 0,
      };

      current.total += 1;
      current.avgScore += ev.aiTeachingSuitabilityScore || 0;

      const bucket = getBucket(ev.aiFinalRecommendation);
      if (bucket === "RECOMENDADA") current.recommended += 1;
      if (bucket === "NO_RECOMENDAR") current.notRecommended += 1;

      map.set(key, current);
    });

    return Array.from(map.values())
      .map((s) => ({
        ...s,
        avgScore: s.total > 0 ? s.avgScore / s.total : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [evaluations]);

  const recommendedPct =
    metrics.total > 0 ? (metrics.recommended / metrics.total) * 100 : 0;
  const highRiskPct =
    metrics.total > 0 ? (metrics.notRecommended / metrics.total) * 100 : 0;

  // --- render ---

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white font-sans relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
            <div>
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold tracking-widest text-xs uppercase">
                    <LayoutDashboard size={16} /> Admin Console
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    Panel de Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Global</span>
                </h1>
                <p className="text-neutral-400 mt-2 max-w-2xl text-sm leading-relaxed">
                    Monitoreo en tiempo real del proceso de evaluación docente. Métricas de desempeño, riesgos y distribución por escuelas.
                </p>
            </div>
        </header>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-sm font-medium animate-pulse">Sincronizando métricas globales...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-red-400 gap-4 bg-red-500/5 rounded-3xl border border-red-500/10">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm text-center max-w-md">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* METRICS GRID */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Total */}
              <div className="bg-[#0f1110]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <FileText size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Total</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 tracking-tight">{metrics.total}</div>
                <div className="text-xs text-neutral-400">Evaluaciones registradas</div>
              </div>

              {/* Card 2: Avg Score */}
              <div className="bg-[#0f1110]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                        <Activity size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Promedio</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 tracking-tight">
                    {metrics.avgScore.toFixed(1)}<span className="text-lg text-neutral-600 font-medium">/100</span>
                </div>
                <div className="text-xs text-neutral-400">Score de idoneidad global</div>
              </div>

              {/* Card 3: Recommended */}
              <div className="bg-[#0f1110]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Aprobados</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 tracking-tight">{recommendedPct.toFixed(0)}%</div>
                <div className="text-xs text-neutral-400 mb-3">{metrics.recommended} candidatos viables</div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${recommendedPct}%` }} />
                </div>
              </div>

              {/* Card 4: High Risk */}
              <div className="bg-[#0f1110]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-rose-500/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                        <AlertCircle size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Riesgo Alto</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 tracking-tight">{highRiskPct.toFixed(0)}%</div>
                <div className="text-xs text-neutral-400 mb-3">{metrics.notRecommended} no recomendados</div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${highRiskPct}%` }} />
                </div>
              </div>
            </section>

            {/* MAIN CONTENT AREA */}
            <div className="space-y-6">
                
                {/* Filters Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#0a0a0a] p-2 rounded-2xl border border-white/10 sticky top-4 z-30 shadow-2xl shadow-black/50">
                    {/* Search Input */}
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Buscar candidato, escuela o programa..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0f1110] border-none rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:ring-2 focus:ring-emerald-500/20 focus:bg-[#141414] transition-all"
                        />
                    </div>
                    
                    {/* School Filter */}
                    <div className="relative md:w-1/3 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                        </div>
                        <select 
                            value={selectedSchool}
                            onChange={(e) => setSelectedSchool(e.target.value)}
                            className="w-full bg-[#0f1110] border-none rounded-xl pl-12 pr-10 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/20 focus:bg-[#141414] appearance-none cursor-pointer transition-all"
                        >
                            <option value="TODAS">Todas las Escuelas</option>
                            {schoolOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: School Performance (Sticky) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[650px] sticky top-24">
                            <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm">
                                <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
                                    <Building2 size={16} className="text-emerald-400" />
                                    Desempeño por Escuela
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {schoolsSummary.map((s) => {
                                    const recRate = s.total > 0 ? (s.recommended / s.total) * 100 : 0;
                                    return (
                                        <div key={s.schoolName} className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors" title={s.schoolName}>{s.schoolName}</h4>
                                                <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-neutral-400">{s.total}</span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {/* Score Bar */}
                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-neutral-500 font-medium">Score Promedio</span>
                                                        <span className="text-cyan-400 font-mono">{s.avgScore.toFixed(1)}</span>
                                                    </div>
                                                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-500" style={{ width: `${s.avgScore}%` }}></div>
                                                    </div>
                                                </div>
                                                {/* Recommended Bar */}
                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-neutral-500 font-medium">Tasa Aprobación</span>
                                                        <span className={`font-mono ${recRate >= 70 ? "text-emerald-400" : "text-rose-400"}`}>{recRate.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${recRate >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${recRate}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {schoolsSummary.length === 0 && <div className="text-center text-neutral-600 text-sm py-10">Sin datos disponibles</div>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recent Evaluations List */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0f1110] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[650px]">
                             <div className="p-6 border-b border-white/5 bg-[#141414]/50 backdrop-blur-sm flex justify-between items-center">
                                <h3 className="text-white font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
                                    <Users size={16} className="text-cyan-400" />
                                    Evaluaciones Recientes
                                </h3>
                                <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-neutral-400 border border-white/5">
                                    {filteredEvaluations.length} Registros
                                </span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#0a0a0a]/50">
                                {filteredEvaluations.length > 0 ? (
                                    filteredEvaluations.map((ev) => (
                                        <div key={ev.id} className="transform transition-all hover:scale-[1.01]">
                                            <TeacherEvaluationItem evaluation={ev} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-4">
                                        <div className="p-4 bg-white/5 rounded-full">
                                            <Search size={32} className="opacity-50" />
                                        </div>
                                        <p className="text-sm">No se encontraron evaluaciones con los filtros actuales.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminConsole;