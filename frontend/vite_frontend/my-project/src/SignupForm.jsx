import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "./api";

export default function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await apiFetch("/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Unexpected error"); return; }
    setSubmitted(true);
  };

 return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-zinc-900 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>

        {submitted ? (
          <>
            <p className="text-green-400 text-center">
              ✅ Thanks for signing up, {form.name}!
            </p>

            <Link to="/login">
              <button
                type="button"
                className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-md font-medium transition"
              >
                Sign in
              </button>
            </Link>

          </>

        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div>
              <label className="block text-sm mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-md font-medium transition"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
