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
  upcomingEvents
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

  const activeLive = liveClasses.length > 0 ? liveClasses[0] : null;
  const marqueeNotices = notices.length > 0 ? [...notices, ...notices] : [];

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
      {/* Styles for continuous vertical scroll marquee */}
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .marquee-viewport {
          height: 300px;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
        .marquee-track {
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: scrollUp 16s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 1. Live Class Alert (At the absolute top if any live stream is active) */}
      {activeLive && (
        <div className="rounded-[1.75rem] border border-red-200 bg-gradient-to-r from-red-50 to-red-100/30 p-5 shadow-soft flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white shrink-0 shadow-md">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-red-700">{activeLive.eventName}</h2>
              <p className="text-sm text-red-600 font-semibold mt-0.5">
                Live Class is Active!
              </p>
            </div>
          </div>
          {activeLive.link ? (
            <a
              href={activeLive.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 shadow-md shrink-0 active:scale-95"
            >
              Join Live Class Now
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      )}

      {/* 2. Welcome Greeting Block */}
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
                  {session?.coachingName || "Raj Tuition Classes"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Event Notices Up-to-Down Scrolling Marquee Section */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb] shrink-0">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Events Notice Board</h2>
            <p className="mt-0.5 text-xs text-slate-400">Continuous feed. Hover to pause, click to open links.</p>
          </div>
        </div>

        <div className="mt-5 border border-slate-100 bg-slate-50/50 rounded-2xl p-3">
          {notices.length ? (
            <div className="marquee-viewport">
              <div className="marquee-track">
                {marqueeNotices.map((notice, idx) => (
                  <div
                    key={`${notice.id}-${idx}`}
                    onClick={() => {
                      if (notice.noticeLink) {
                        window.open(notice.noticeLink, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className={`flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-sm transition hover:border-[#2563eb]/25 ${
                      notice.noticeLink ? "cursor-pointer hover:bg-blue-50/10" : "cursor-default"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Bell className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold text-slate-850 truncate">
                        {notice.title}
                      </span>
                    </div>
                    {notice.noticeLink && (
                      <span className="text-xs font-semibold text-[#2563eb] flex items-center gap-1 shrink-0 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                        Open Notice Link
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    )}
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
