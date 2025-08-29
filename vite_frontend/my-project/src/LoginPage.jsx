import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [user, setUser] = useState(null);

  // Check session once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          credentials: "include",       
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      }
    })();
  }, []); 

  // If already logged in, redirect home
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include if server sets a cookie on login
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      let payload = null;
      try { payload = await res.json(); } catch {}

      if (!res.ok) {
        setError(payload?.error || `Request failed (${res.status})`);
        return;
      }

      navigate("/"); 
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold">Log in</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full rounded-md border border-zinc-800 bg-zinc-800/60 p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-zinc-800 bg-zinc-800/60 p-3 pr-12 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto inline-flex h-8 items-center rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 hover:bg-zinc-700"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-zinc-400">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-700 bg-zinc-800" />
              Remember me
            </label>
            <a href="#" className="text-emerald-400 hover:text-emerald-300">Forgot?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-500 p-3 font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-400">
          New here? <a href="/signup" className="text-emerald-400 hover:text-emerald-300">Create an account</a>
        </p>
      </div>
    </main>
  );
}
