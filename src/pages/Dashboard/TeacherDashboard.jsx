import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  Clock3,
  TrendingUp,
  Video,
  ExternalLink,
  Megaphone,
  Bell,
  Trash2
} from "lucide-react";
import ActionCard from "../../components/teacher-dashboard/ActionCard";
import SectionCard from "../../components/teacher-dashboard/SectionCard";
import {
  quickActions,
} from "../../components/teacher-dashboard/dashboardConfig";
import { getSession } from "../../utils/auth";
import { supabase } from "../../utils/supabase";
import { fetchLiveEvents } from "../../utils/galleryManagement";

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

  const [liveClasses, setLiveClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        // 1. Fetch live stream events
        const liveData = await fetchLiveEvents();

        // 2. Fetch notices
        const { data: noticesData } = await supabase
          .from("notices")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (mounted) {
          setLiveClasses(liveData || []);
          setNotices(
            (noticesData || []).map((row) => ({
              id: row.id,
              title: row.title || "",
              noticeLink: row.link || "",
            }))
          );
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Styles for simple scrollable list (no animation to prevent glitches) */}
      <style>{`
        .notice-list-viewport {
          max-height: 250px;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 4px;
        }
        .notice-list-viewport::-webkit-scrollbar {
          width: 4px;
        }
        .notice-list-viewport::-webkit-scrollbar-track {
          background: transparent;
        }
        .notice-list-viewport::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .notice-list-track {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>

      {/* 1. Live Class Alerts (At the absolute top if any live stream is active) */}
      {liveClasses.length > 0 && (
        <div className="space-y-3">
          {liveClasses.map((item, idx) => (
            <div
              key={item.id || idx}
              className="rounded-[1.75rem] border border-red-200 bg-linear-to-r from-red-50 to-red-100/30 p-5 shadow-soft flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white shrink-0 shadow-md">
                  <Video className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-red-700">{item.eventName}</h2>
                  <p className="text-sm text-red-600 font-semibold mt-0.5">
                    Live Class is Active!
                  </p>
                </div>
              </div>
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 shadow-md shrink-0 active:scale-95"
                >
                  Join Live Class Now
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* 2. Welcome Greeting Block */}
      <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-purple-50/20 to-blue-50/45 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
              <TrendingUp className="h-3.5 w-3.5 text-brand" />
              Live teacher overview
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {greeting}, {session?.displayName || "Teacher"}.
            </h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                Current date
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {dateLabel}
              </p>
            </div>
            
          </div>
        </div>

        {/* Quote Banner */}
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-blue-200/50 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-5 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.005]">
          {/* Decorative blur elements */}
          <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-white/10 blur-xl"></div>
          
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-xs shrink-0 select-none text-2xl">
              🌸
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-100">
                Motto of RTC
              </p>
              <p className="mt-1 text-base sm:text-lg font-bold italic tracking-wide text-white leading-relaxed">
                "Come to the garden Of RTC and get the flower of success"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Event Notices Up-to-Down Scrolling Marquee Section */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand shrink-0">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Events Notice Board</h2>
            <p className="mt-0.5 text-xs text-slate-400">Continuous feed. Hover to pause, click to open links.</p>
          </div>
        </div>

        <div className="mt-5 border border-slate-100 bg-slate-50/50 rounded-2xl p-3">
          {notices.length ? (
            <div className="notice-list-viewport">
              <div className="notice-list-track">
                {notices.map((notice, idx) => (
                  <div
                    key={`${notice.id}-${idx}`}
                    onClick={() => {
                      if (notice.noticeLink) {
                        window.open(notice.noticeLink, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className={`flex items-start justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-sm transition hover:border-brand/25 ${
                      notice.noticeLink ? "cursor-pointer hover:bg-blue-50/10" : "cursor-default"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                        <Bell className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold text-slate-850 whitespace-normal wrap-break-word">
                        {notice.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
              No recent notice events scheduled at this moment.
            </div>
          )}
        </div>
      </section>

      {/* 4. Quick Actions Shortcuts Grid Section */}
      <SectionCard
        title="Quick actions"
        subtitle="Common tasks"
        action={
          <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {quickActions.length} shortcuts
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quickActions.map((action) => (
            <ActionCard key={action.label} {...action} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default TeacherDashboard;
