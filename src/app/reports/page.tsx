import { prisma } from "@/lib/prisma";

function getLastNDaysRange(days: number) {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  return { from, to: now };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const auth = params.auth as string | undefined;

  const { from } = getLastNDaysRange(7);

  const [recentAttendance, allMembers] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        checkedInAt: {
          gte: from,
        },
      },
      orderBy: { checkedInAt: "desc" },
      include: { member: true, session: true },
    }),
    prisma.member.findMany({ include: { attendances: true } }),
  ]);

  const totalRecords = recentAttendance.length;
  const presentRecords = recentAttendance.filter(
    (a) => a.status === "PRESENT",
  ).length;
  const attendanceRate =
    totalRecords === 0 ? 0 : (presentRecords / totalRecords) * 100;

  const avgEngagement =
    totalRecords === 0
      ? 0
      :
        recentAttendance.reduce((sum, a) => sum + a.engagementScore, 0) /
        totalRecords;

  const memberSummaries = allMembers.map((member) => {
    const recent = member.attendances.filter(
      (a) => a.checkedInAt >= from,
    );
    const total = recent.length;
    const present = recent.filter((a) => a.status === "PRESENT").length;
    const rate = total === 0 ? 0 : (present / total) * 100;
    const avg =
      total === 0
        ? 0
        : recent.reduce((sum, a) => sum + a.engagementScore, 0) / total;

    return {
      id: member.id,
      name: member.name,
      total,
      present,
      attendanceRate: rate,
      avgEngagement: avg,
    };
  });

  return (
    <div className="space-y-6">
      {auth === "login-success" && (
        <div className="alert-auto-dismiss rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
          Logged in successfully.
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Weekly summary
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Attendance and engagement for the last 7 days.
          </p>
        </div>
        <a
          href="/api/export-attendance"
          className="inline-flex items-center justify-center rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-500/20"
        >
          Export CSV
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs font-medium text-slate-400">Records</p>
          <p className="mt-2 text-2xl font-semibold">{totalRecords}</p>
          <p className="mt-1 text-xs text-slate-500">
            Total check-ins logged this week.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-xs font-medium text-slate-400">Attendance rate</p>
          <p className="mt-2 text-2xl font-semibold">
            {attendanceRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Present vs all recent check-ins.
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
            Based on recent scores.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight">
          Member breakdown
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Per‑member attendance rate and engagement in the last 7 days.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-2 pr-4">Member</th>
                <th className="py-2 pr-4 text-right">Sessions</th>
                <th className="py-2 pr-4 text-right">Present</th>
                <th className="py-2 pr-4 text-right">Attendance %</th>
                <th className="py-2 pr-4 text-right">Avg engagement</th>
              </tr>
            </thead>
            <tbody>
              {memberSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-xs text-slate-500"
                  >
                    No data yet. Add members, create sessions, and start
                    checking people in.
                  </td>
                </tr>
              ) : (
                memberSummaries.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-2 pr-4 text-slate-100">{m.name}</td>
                    <td className="py-2 pr-4 text-right text-slate-100">
                      {m.total}
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-100">
                      {m.present}
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-100">
                      {m.attendanceRate.toFixed(1)}%
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-100">
                      {m.avgEngagement.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
