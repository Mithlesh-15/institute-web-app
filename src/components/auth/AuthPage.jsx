import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import BrandLogo from "../BrandLogo";
import {
  authenticateMockUser,
  getSession,
  isValidPhone,
} from "../../utils/auth";

const roleStyles = {
  student: {
    badge: "Student access",
    badgeTone: "bg-blue-50 text-blue-700 border-blue-200",
    accentLine: "bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]",
    formTitle: "Sign in",
    formSubtitle: "Use your registered phone number and password.",
    buttonLabel: "Sign in",
  },
  teacher: {
    badge: "Private staff portal",
    badgeTone: "bg-slate-100 text-slate-700 border-slate-200",
    accentLine: "bg-gradient-to-r from-[#0f172a] to-[#2563eb]",
    formTitle: "Sign in",
    formSubtitle: "Use your registered phone number and password.",
    buttonLabel: "Sign in",
  },
};

function AuthPage({ role }) {
  const navigate = useNavigate();
  const styles = roleStyles[role];
  const currentSession = getSession();
  const sessionToken = currentSession?.token;
  const sessionRole = currentSession?.role;

  const [form, setForm] = useState({
    phone: "",
    password: "",
    rememberSession: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (sessionToken) {
      navigate(`/${sessionRole || role}/dashboard`, { replace: true });
    }
  }, [navigate, role, sessionRole, sessionToken]);

  const updateField = (field) => (event) => {
    const value =
      field === "rememberSession" ? event.target.checked : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authenticateMockUser({
        role,
        phone: form.phone,
        password: form.password,
        rememberSession: form.rememberSession,
      });

      navigate(result.redirectTo, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to login right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (sessionToken) {
    return <Navigate to={`/${sessionRole || role}/dashboard`} replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-[#2563eb]/10 blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-80 w-80 rounded-full bg-[#0f172a]/8 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[18%] h-72 w-72 rounded-full bg-[#dbeafe]/40 blur-3xl" />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl">
          <div
            className={[
              "relative w-full rounded-[2rem] border border-white/80 bg-white/92 p-5 shadow-[0_26px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl",
              "sm:p-8",
              "transition-transform duration-300 ease-out hover:-translate-y-1",
            ].join(" ")}
          >
            <div
              className={`absolute inset-x-6 top-0 h-1 rounded-full ${styles.accentLine}`}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1 shadow-[0_14px_30px_rgba(37,99,235,0.25)]">
                  <BrandLogo className="h-full w-full object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Login portal
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${styles.badgeTone}`}
              >
                {styles.badge}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                {styles.formTitle}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                {styles.formSubtitle}
              </p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <Input
                id={`${role}-phone`}
                label="Phone number"
                placeholder="Enter your 10-digit phone number"
                value={form.phone}
                onChange={updateField("phone")}
                autoComplete="tel"
                inputMode="numeric"
                error={error && !isValidPhone(form.phone) ? error : ""}
                disabled={loading}
                hint="Use the mobile number linked to your portal."
              />

              <Input
                id={`${role}-password`}
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={updateField("password")}
                autoComplete="current-password"
                error={error && isValidPhone(form.phone) ? error : ""}
                disabled={loading}
                rightSlot={
                  <button
                    type="button"
                    className="text-sm font-medium text-[#2563eb] transition hover:text-[#1d4ed8]"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
              />

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  id={`${role}-remember`}
                  type="checkbox"
                  checked={form.rememberSession}
                  onChange={updateField("rememberSession")}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563eb] accent-[#2563eb]"
                />
                <label
                  htmlFor={`${role}-remember`}
                  className="text-sm leading-6 text-slate-700"
                >
                  Keep me signed in
                  <span className="block text-xs text-slate-500">
                    Only on this device.
                  </span>
                </label>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" loading={loading} fullWidth>
                {styles.buttonLabel}
              </Button>
            </form>

            <div className="mt-6 text-sm text-slate-500">
              Sign in to continue to your dashboard.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuthPage;
