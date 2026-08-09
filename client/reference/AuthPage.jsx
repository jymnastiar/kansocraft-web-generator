import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";
// Opsional: Import komponen panel kiri (Branding) jika Anda memisahkannya
// import AuthLeftPanel from '../components/AuthLeftPanel';

export default function AuthPage({ mode }) {
  const navigate = useNavigate();

  // Mengambil fungsi auth dari AppContext
  const { login, register } = useAppContext();

  // Mengecek apakah halaman sedang dalam mode login atau register
  const isLogin = mode === "login";

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      // Jika berhasil, context akan otomatis mengarahkan (navigate) user ke '/'
    } catch (err) {
      // Menangkap error dari backend/context
      setError(err.message || "Terjadi kesalahan saat otentikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* KIRI: Panel Branding (Bisa dipisah menjadi komponen tersendiri) */}
      <div className="hidden lg:flex lg:flex-1 relative bg-zinc-900 flex-col justify-between p-12 text-white overflow-hidden">
        {/* Placeholder untuk background image/pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('/bg-image.png')] bg-cover bg-center" />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="size-9" />
          <span className="text-2xl font-bold font-heading">KansoCraft</span>
        </div>

        <div className="relative z-10 mt-auto">
          <h2 className="text-4xl font-semibold mb-4">
            Build your presence on web.
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md text-sm leading-relaxed">
            Generate, edit, and publish modern websites instantly using the
            power of AI and clean code architecture.
          </p>
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} KansoCraft. All rights reserved.
          </p>
        </div>
      </div>

      {/* KANAN: Panel Form Autentikasi */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
              {isLogin ? "Sign In" : "Create an account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your website builder."
                : "Get started by entering your registration details."}
            </p>
          </div>

          {/* Menampilkan pesan error jika login/register gagal */}
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Nama hanya muncul di mode Register */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Takumi Fujiwara"
                  className="w-full px-3 py-2.5 bg-input/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 bg-input/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-input/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password || (!isLogin && !name)}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading && <Loader2 size={18} className="animate-spin mr-2" />}
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {/* Toggle Link Mode */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                New to KansoCraft?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-semibold transition-all"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-semibold transition-all"
                >
                  Sign in here
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
