import { useMemo } from "react";
import { CalendarDays, Clock3, TrendingUp } from "lucide-react";
import ActionCard from "../../components/teacher-dashboard/ActionCard";
import SectionCard from "../../components/teacher-dashboard/SectionCard";
import StatsCard from "../../components/teacher-dashboard/StatsCard";
import {
  quickActions,
  upcomingEvents,
} from "../../components/teacher-dashboard/dashboardConfig";
import { getSession } from "../../utils/auth";

function formatDateLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function TeacherDashboard() {
  const session = getSession();
  const dateLabel = useMemo(() => formatDateLabel(), []);
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.06),rgba(219,234,254,0.4))] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <TrendingUp className="h-3.5 w-3.5 text-[#2563eb]" />
                Live teacher overview
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {greeting}, {session?.displayName || "Teacher"}.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                You are viewing the{" "}
                {session?.coachingName || "tuition workspace"} dashboard. Track
                classes, fees, attendance, and updates from one polished control
                center.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <CalendarDays className="h-4 w-4 text-[#2563eb]" />
                  Current date
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {dateLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Clock3 className="h-4 w-4 text-[#2563eb]" />
                  Coaching name
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {session?.coachingName || "RTC Tuition"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          title="Quick actions"
          subtitle="Common tasks"
          action={
            <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              8 shortcuts
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {quickActions.map((action) => (
              <ActionCard key={action.label} {...action} />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Upcoming events" subtitle="Schedule">
          <div className="space-y-4">
            {upcomingEvents.map((event) => {
              const Icon = event.icon;

              return (
                <div
                  key={event.title}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                >
                <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.08))] p-3 text-[#2563eb]">
                  <Icon className="h-5 w-5" />
                </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {event.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Workspace pulse" subtitle="Snapshot">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Batches", "08"],
              ["Fee follow-ups", "14"],
              ["Announcements", "03"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default TeacherDashboard;
