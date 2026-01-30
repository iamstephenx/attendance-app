import { prisma } from "@/lib/prisma";
import DashboardCharts from "./_components/dashboard-charts";

type AttendanceTrendPoint = {
  label: string;
  present: number;
  engagement: number;
};

type TopMemberPoint = {
  name: string;
  avgEngagement: number;
  attendedSessions: number;
};

export default async function Home() {
  const [
    memberCount,
    sessionCount,
    totalAttendance,
    presentAttendance,
    engagementAgg,
    recentSessions,
    membersWithAttendance,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.session.count(),
    prisma.attendance.count(),
    prisma.attendance.count({
      where: { status: "PRESENT" },
    }),
    prisma.attendance.aggregate({
      _avg: { engagementScore: true },
    }),
    prisma.session.findMany({
      orderBy: { date: "desc" },
      take: 7,
      include: { attendances: true },
    }),
    prisma.member.findMany({
      include: { attendances: true },
    }),
  ]);

  const attendanceRate =
    totalAttendance === 0 ? 0 : (presentAttendance / totalAttendance) * 100;

  const avgEngagement = engagementAgg._avg.engagementScore ?? 0;

  const attendanceTrend: AttendanceTrendPoint[] = recentSessions
    .map((session) => {
      const presentCount = session.attendances.filter(
        (a) => a.status === "PRESENT",
      ).length;
      const avgSessionEngagement =
        session.attendances.length === 0
          ? 0
          :
            session.attendances.reduce(
              (sum, a) => sum + a.engagementScore,
              0,
            ) / session.attendances.length;

      const date = new Date(session.date);
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        label,
        present: presentCount,
        engagement: Number(avgSessionEngagement.toFixed(2)),
      };
    })
    .reverse();

  const topMembers: TopMemberPoint[] = membersWithAttendance
    .map((member) => {
      const attendedSessions = member.attendances.filter(
        (a) => a.status === "PRESENT",
      );
      const avgMemberEngagement =
        member.attendances.length === 0
          ? 0
          :
            member.attendances.reduce(
              (sum, a) => sum + a.engagementScore,
              0,
            ) / member.attendances.length;

      return {
        name: member.name,
        attendedSessions: attendedSessions.length,
        avgEngagement: Number(avgMemberEngagement.toFixed(2)),
      };
    })
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Attendance overview
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Live snapshot of how your class or team is showing up and engaging.
          </p>
        </div>
        <div className="flex gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Attendance</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span>Engagement</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs font-medium text-slate-400">Members</p>
          <p className="mt-2 text-2xl font-semibold">{memberCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            People actively tracked in this workspace.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs font-medium text-slate-400">Sessions</p>
          <p className="mt-2 text-2xl font-semibold">{sessionCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            Meetings or classes logged so far.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs font-medium text-slate-400">Attendance rate</p>
          <p className="mt-2 text-2xl font-semibold">
            {attendanceRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Present vs all recorded check-ins.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs font-medium text-slate-400">
            Avg engagement (1–5)
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {avgEngagement.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on all submitted scores.
          </p>
        </div>
      </div>

      <DashboardCharts
        attendanceTrend={attendanceTrend}
        topMembers={topMembers}
      />

      <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Recent sessions
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Last 7 sessions with attendance and engagement.
            </p>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Session</th>
                <th className="py-2 pr-4 text-right">Present</th>
                <th className="py-2 pr-4 text-right">Avg engagement</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-xs text-slate-500"
                  >
                    No sessions yet. Create a session and start checking people
                    in.
                  </td>
                </tr>
              ) : (
                recentSessions.map((session) => {
                  const date = new Date(session.date);
                  const label = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const presentCount = session.attendances.filter(
                    (a) => a.status === "PRESENT",
                  ).length;
                  const avgSessionEngagement =
                    session.attendances.length === 0
                      ? 0
                      :
                        session.attendances.reduce(
                          (sum, a) => sum + a.engagementScore,
                          0,
                        ) / session.attendances.length;

                  return (
                    <tr
                      key={session.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-2 pr-4 text-slate-200">{label}</td>
                      <td className="py-2 pr-4 text-slate-200">
                        {session.title}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-100">
                        {presentCount}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-100">
                        {avgSessionEngagement.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
