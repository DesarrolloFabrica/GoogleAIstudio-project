import React from "react";

const CoordinatorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020202] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Consola de Coordinador</h1>
      <p className="text-gray-400">
        Aquí irá la bandeja de evaluaciones pendientes, historial de decisiones,
        filtros por escuela/programa, etc.
      </p>
    </div>
  );
};

export default CoordinatorDashboard;
