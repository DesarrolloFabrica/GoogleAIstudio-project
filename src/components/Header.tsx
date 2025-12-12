// src/components/Header.tsx
import React from "react";
import LogoCUN from "../assets/images/LogoCUN.png";

type ViewMode = "analyze" | "history";

interface HeaderProps {
  mode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, onChangeMode }) => {
  return (
    <header className="relative w-full border-b border-white/10 bg-[#0a0a0a]">
      <div className="relative z-10 container mx-auto px-6 py-5 md:py-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo y textos */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <img
                src={LogoCUN}
                alt="Logo Ópera"
                className="h-10 w-10 object-contain"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                OPE-CUN
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="hidden md:block w-8 h-[1px] bg-[#00FF88]/50"></span>
                <span className="text-sm md:text-base text-gray-300 font-light tracking-wide">
                  IA para Facilitadores
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Analizar / Historial */}
          <div className="bg-[#050505] border border-white/10 rounded-full px-1.5 py-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest">
            <button
              type="button"
              onClick={() => onChangeMode("analyze")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                mode === "analyze"
                  ? "bg-emerald-500 text-black shadow-[0_0_18px_rgba(16,185,129,0.7)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Analizar
            </button>
            <button
              type="button"
              onClick={() => onChangeMode("history")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                mode === "history"
                  ? "bg-cyan-500 text-black shadow-[0_0_18px_rgba(6,182,212,0.7)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Historial
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
