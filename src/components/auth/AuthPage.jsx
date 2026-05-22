import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import {
  authenticateMockUser,
  getNewUserDraft,
  getSession,
  isValidPhone,
} from "../../utils/auth";

const roleStyles = {
  student: {
    badge: "Learner access",
    badgeTone: "bg-[#ffd900]/20 text-[#7a5a00] border-[#ffd900]/35",
    heroTitle: "Fast, friendly access to your learning space.",
    heroCopy:
      "A mobile-first login designed for students: quick sign-in, warm visuals, and a clear path back to class.",
    heroBullets: [
      "Phone number login",
      "One clean step to your dashboard",
      "Optimized for handheld use",
    ],
    introTone: "bg-[#fff8ef]",
    cardGlow: "from-[#f25d0d]/12 via-white to-[#ff9100]/10",
    sidePanel:
      "bg-[linear-gradient(180deg,rgba(242,93,13,0.08),rgba(255,145,0,0.03),rgba(255,255,255,0.96))]",
    accentLine: "bg-gradient-to-r from-[#f25d0d] to-[#ff9100]",
    helperTone: "text-[#8a3d0d]",
    demoTone: "border-[#ffd900]/40 bg-[#ffd900]/12",
    titleTone: "text-slate-900",
    subtitleTone: "text-slate-600",
    proseTone: "text-slate-700",
    formTitle: "Welcome back",
    formSubtitle: "Sign in with your student phone number and password.",
    buttonLabel: "Login as student",
    footerLinkLabel: "Student dashboard preview",
    footerLinkHref: "/student/dashboard",
  },
  teacher: {
    badge: "Private staff portal",
    badgeTone: "bg-[#f25d0d]/10 text-[#b74208] border-[#f25d0d]/25",
    heroTitle: "Structured access for teachers and coordinators.",
    heroCopy:
      "This private portal keeps the interface professional, calm, and efficient for coaching and class operations.",
    heroBullets: [
      "Invitation-only access",
      "Designed for staff workflows",
      "Simple login on desktop or mobile",
    ],
    introTone: "bg-[#fff7f1]",
    cardGlow: "from-[#f25d0d]/10 via-white to-[#ffd900]/8",
    sidePanel:
      "bg-[linear-gradient(180deg,rgba(242,93,13,0.06),rgba(31,41,55,0.02),rgba(255,255,255,0.97))]",
    accentLine: "bg-gradient-to-r from-[#f25d0d] to-[#ff9100]",
    helperTone: "text-[#7b3408]",
    demoTone: "border-[#f25d0d]/20 bg-[#f25d0d]/8",
    titleTone: "text-slate-900",
    subtitleTone: "text-slate-600",
    proseTone: "text-slate-700",
    formTitle: "Staff sign in",
    formSubtitle: "Use your teacher phone number and password to continue.",
    buttonLabel: "Login as teacher",
    footerLinkLabel: "Teacher dashboard preview",
    footerLinkHref: "/teacher/dashboard",
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
  const [info, setInfo] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (sessionToken) {
      navigate(`/${sessionRole || role}/dashboard`, { replace: true });
    }
  }, [navigate, role, sessionRole, sessionToken]);

  useEffect(() => {
    const draft = getNewUserDraft();

    if (draft?.role === role) {
      setInfo(
        "A profile setup draft was saved for this portal. Finish the login flow when registration is added.",
      );
    }
  }, [role]);

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

    if (info) {
      setInfo("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const result = await authenticateMockUser({
        role,
        phone: form.phone,
        password: form.password,
        rememberSession: form.rememberSession,
      });

      if (result.status === "new_user") {
        setInfo(result.message);
        return;
      }

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
    <div className="relative min-h-screen overflow-hidden bg-[#fffdf8]">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-[#f25d0d]/10 blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-80 w-80 rounded-full bg-[#ff9100]/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[18%] h-72 w-72 rounded-full bg-[#ffd900]/8 blur-3xl" />
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f25d0d] text-lg font-bold text-white shadow-[0_14px_30px_rgba(242,93,13,0.25)]">
                  RTC
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    App logo placeholder
                  </p>
                  <p className="text-sm text-slate-500">Login portal</p>
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
                    className="text-sm font-medium text-[#f25d0d] transition hover:text-[#d94f09]"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
                hint="Passwords are mocked for now and will be replaced by secure auth later."
              />

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#fffdf8] px-4 py-3">
                <input
                  id={`${role}-remember`}
                  type="checkbox"
                  checked={form.rememberSession}
                  onChange={updateField("rememberSession")}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#f25d0d] accent-[#f25d0d]"
                />
                <label
                  htmlFor={`${role}-remember`}
                  className="text-sm leading-6 text-slate-700"
                >
                  Remember session on this device
                  <span className="block text-xs text-slate-500">
                    Placeholder behavior for local session persistence in the
                    mock login flow.
                  </span>
                </label>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {info ? (
                <div className="rounded-2xl border border-[#ffd900]/50 bg-[#ffd900]/12 px-4 py-3 text-sm text-[#6f5800]">
                  {info}
                </div>
              ) : null}

              <Button type="submit" loading={loading} fullWidth>
                {styles.buttonLabel}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>Session tokens are saved in localStorage for this prototype.</p>
              <Link
                to={styles.footerLinkHref}
                className="font-semibold text-[#f25d0d] transition hover:text-[#d94f09]"
              >
                {styles.footerLinkLabel}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuthPage;
