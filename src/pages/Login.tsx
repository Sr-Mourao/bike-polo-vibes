import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Preencha todos os campos"); return; }
    if (login(email, password)) navigate("/dashboard");
    else setError("Falha ao entrar");
  };

  const handleGoogle = () => {
    loginWithGoogle();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border-4 border-border bg-card text-card-foreground p-8"
      >
        <h1 className="text-5xl font-display text-center mb-2">BIKE POLO</h1>
        <p className="text-center font-heading text-muted-foreground tracking-wider uppercase mb-8">
          Acesse o sistema
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/20 border border-destructive text-destructive text-sm font-heading">
            {error}
          </div>
        )}

        <form onSubmit={handleEmail} className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-heading text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full mt-1 px-4 py-3 bg-background text-foreground border-2 border-border font-heading text-lg focus:border-secondary outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-heading text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" /> Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-3 bg-background text-foreground border-2 border-border font-heading text-lg focus:border-secondary outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-secondary text-secondary-foreground font-heading text-xl uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" /> Entrar
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-card text-muted-foreground font-heading text-sm uppercase">ou</span>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-4 border-2 border-border font-heading text-xl uppercase tracking-wider hover:bg-card hover:border-secondary transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground font-heading">
          Área pública: <a href="/public" className="text-secondary hover:text-accent underline">Ver resultados →</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
