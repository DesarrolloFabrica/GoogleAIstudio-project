// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BrainCircuit } from "lucide-react";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const from = location.state?.from?.pathname;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const user = login(email.trim(), name.trim() || undefined);

    // Si venía de una ruta protegida, volver allí
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    // Si no, redirigir según rol
    if (user.role === "leader") navigate("/leader", { replace: true });
    else if (user.role === "coordinator") navigate("/coordinator", { replace: true });
    else navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#050505] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#0F0F0F] border border-white/10">
              <BrainCircuit className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">OPE-CUN</h1>
              <p className="text-xs text-gray-400">Acceso a consolas por rol</p>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            Usa un correo “simulado” para elegir el rol:
            <br />
            <span className="text-gray-300">
              • contiene <span className="text-emerald-400 font-semibold">admin</span> → Admin
            </span>
            <br />
            <span className="text-gray-300">
              • contiene <span className="text-emerald-400 font-semibold">coord</span> → Coordinador
            </span>
            <br />
            <span className="text-gray-300">• cualquier otro → Líder</span>
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">
                Nombre (opcional)
              </label>
              <input
                type="text"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500/60"
                placeholder="Ej. Sofia Coordinadora"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">
                Correo institucional
              </label>
              <input
                type="email"
                required
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500/60"
                placeholder="ejemplo@cun.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-sm font-bold tracking-widest uppercase py-3 rounded-xl transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
