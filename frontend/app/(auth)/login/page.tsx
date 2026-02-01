"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur de connexion");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[rgba(20,20,20,0.9)] backdrop-blur-xl rounded-2xl border-2 border-[#4FDFFF] shadow-[0_0_40px_rgba(79,223,255,0.15)] p-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenue sur <span className="text-[#FF3333] drop-shadow-[0_0_10px_rgba(255,51,51,0.5)]">HELLO WORLD</span>
        </h1>
        <p className="text-white/60">Connectez-vous pour continuer</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-[#4FDFFF] text-sm font-medium mb-2 tracking-wide">
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#4FDFFF]/30 rounded-lg text-white placeholder-white/40 focus:border-[#4FDFFF] focus:shadow-[0_0_15px_rgba(79,223,255,0.3)] outline-none transition-all"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-[#4FDFFF] text-sm font-medium mb-2 tracking-wide">
            MOT DE PASSE
          </label>
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#4FDFFF]/30 rounded-lg text-white placeholder-white/40 focus:border-[#4FDFFF] focus:shadow-[0_0_15px_rgba(79,223,255,0.3)] outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#FF3333] hover:bg-[#FF5555] border-2 border-[#4FDFFF] text-white font-bold rounded-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(79,223,255,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connexion...
            </span>
          ) : (
            "SE CONNECTER"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-[#4FDFFF] hover:text-white transition-colors font-medium"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

