import React from "react";

import LogoCUN from "../assets/images/LogoCUN.png";

// ------------------------------------------------------

const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.2a1 1 0 0 0 .976.992A4.501 4.501 0 0 1 21 11.5v5.5a4 4 0 0 1-4 4h-1.5a1.5 1.5 0 0 1-1.5-1.5v-1.5a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 8 16.5v1.5A1.5 1.5 0 0 1 6.5 21H5a4 4 0 0 1-4-4v-5.5A4.5 4.5 0 0 1 9.024 6.692 1 1 0 0 0 10 5.7V4.5A2.5 2.5 0 0 1 12 2a2.5 2.5 0 0 1 2.5 2.5" />
    <path d="M12 11.5V14" />
    <path d="M9 11.5a1.5 1.5 0 0 1-3 0" />
    <path d="M18 11.5a1.5 1.5 0 0 0-3 0" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="relative w-full border-b border-white/10 bg-[#0a0a0a]">
      {/* 2. CONTENIDO DEL HEADER */}
      <div className="relative z-10 container mx-auto px-6 py-5 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo y Títulos */}
          <div className="flex items-center gap-5">
            {/* Contenedor del Icono con efecto Glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <img
                src={LogoCUN}
                alt="Logo Ópera"
                className="h-10 w-10 object-contain" // 'object-contain' evita que la imagen se estire
              />
            </div>

            {/* Texto con jerarquía visual */}
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
        </div>
      </div>
    </header>
  );
};

export default Header;
