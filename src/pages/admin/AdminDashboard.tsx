import React from "react";

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020202] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Consola de Admin</h1>
      <p className="text-gray-400">
        Aquí irá el tablero global: uso por escuela, porcentaje aprobados,
        costos parametrizados y auditoría completa.
      </p>
    </div>
  );
};

export default AdminDashboard;
