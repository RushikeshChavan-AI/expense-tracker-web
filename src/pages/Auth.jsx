import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Wallet } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { user, loading, isSupabaseConfigured, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [from, navigate, user]);

  if (!loading && user) return <Navigate to={from} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.email || !form.password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    const { error: authError } = await signIn(form.email, form.password);
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10 text-ink">
      <div className="ambient-blob left-[-12rem] top-[-12rem] h-96 w-96 bg-gold/10" />
      <div className="ambient-blob bottom-[-12rem] right-[-12rem] h-96 w-96 bg-violet/10" />

      <section className="glass relative z-10 grid w-full max-w-4xl overflow-hidden rounded-2xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex min-h-72 flex-col justify-between bg-white/[0.035] p-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-bg shadow-glow">
              <Wallet size={19} />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none">Expense</p>
              <p className="font-display text-sm font-bold leading-none text-gold">Tracker</p>
            </div>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Your money, your account.</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Sign in to keep transactions, categories, imports, and dashboard totals separated for each user.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-ink">Sign in</h2>
            <p className="mt-1 text-sm text-muted">Use the account already created for this tracker.</p>
          </div>

          {!isSupabaseConfigured ? (
            <div className="rounded-xl border border-coral/30 bg-coral/10 p-4 text-sm text-coral">
              Supabase is not configured yet. Add <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code>.env</code> file, then restart the dev server.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                icon={Mail}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="Password"
                icon={LockKeyhole}
                type="password"
                autoComplete="current-password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              {error && <p className="text-sm text-coral">{error}</p>}
              {message && <p className="text-sm text-emerald">{message}</p>}
              <Button type="submit" loading={submitting} fullWidth>
                Sign in
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
