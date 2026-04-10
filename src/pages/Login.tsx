import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

const Login = () => {
  const { login, loginWithProvider } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }
    login(email, password);
    navigate("/dashboard");
  };

  const handleProvider = (provider: "google" | "facebook") => {
    loginWithProvider(provider);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="block text-center font-display text-4xl text-primary-foreground mb-8 hover:text-secondary transition-colors">
          🚲 BIKE POLO
        </Link>

        <div className="bg-card text-card-foreground border-4 border-border p-8">
          <h1 className="font-display text-3xl text-center mb-6">LOGIN</h1>

          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleProvider("google")}
              className="w-full py-3 bg-background text-foreground font-heading text-lg uppercase tracking-wider border-2 border-border hover:border-secondary transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </button>
            <button
              onClick={() => handleProvider("facebook")}
              className="w-full py-3 bg-[hsl(221,44%,41%)] text-white font-heading text-lg uppercase tracking-wider border-2 border-transparent hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Entrar com Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-heading text-muted-foreground uppercase">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-heading text-sm uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-background text-foreground border-2 border-border font-body focus:border-secondary outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block font-heading text-sm uppercase tracking-wider mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-background text-foreground border-2 border-border font-body focus:border-secondary outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-destructive text-sm font-heading">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-secondary text-secondary-foreground font-heading text-xl uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Entrar
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4 font-heading">
            Mock: qualquer email/senha funciona
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
