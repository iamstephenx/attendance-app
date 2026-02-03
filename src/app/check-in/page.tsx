import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function submitCheckIn(formData: FormData) {
  "use server";

  const memberId = formData.get("memberId")?.toString();
  const sessionId = formData.get("sessionId")?.toString();
  const status = formData.get("status")?.toString() as AttendanceStatus | null;
  const engagementStr = formData.get("engagementScore")?.toString();

  if (!memberId || !sessionId || !status || !engagementStr) {
    return;
  }

  let engagementScore = Number(engagementStr);
  if (!Number.isFinite(engagementScore)) {
    return;
  }
  if (engagementScore < 1) engagementScore = 1;
  if (engagementScore > 5) engagementScore = 5;

  await prisma.attendance.upsert({
    where: {
      memberId_sessionId: {
        memberId,
        sessionId,
      },
    },
    update: {
      status,
      engagementScore,
    },
    create: {
      memberId,
      sessionId,
      status,
      engagementScore,
    },
  });

  revalidatePath("/check-in");
  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/sessions");
  revalidatePath("/reports");
}

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const auth = params.auth as string | undefined;

  const [members, sessions, recentAttendance] = await Promise.all([
    prisma.member.findMany({ orderBy: { name: "asc" } }),
    prisma.session.findMany({ orderBy: { date: "desc" }, take: 20 }),
    prisma.attendance.findMany({
      orderBy: { checkedInAt: "desc" },
      take: 10,
      include: { member: true, session: true },
    }),
  ]);

  const latestSession = sessions[0];

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
            Quick check-in
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Record attendance and engagement scores in just a few clicks.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <form
          action={submitCheckIn}
          className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5"
        >
          <h2 className="text-sm font-semibold tracking-tight">New check-in</h2>
          <p className="mt-1 text-xs text-slate-400">
            Choose a member, session, status, and 1–5 engagement score.
          </p>

          {members.length === 0 || sessions.length === 0 ? (
            <p className="mt-4 text-xs text-amber-300">
              You need at least one member and one session before recording
              check-ins.
            </p>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-300"
                  htmlFor="memberId"
                >
                  Member
                </label>
                <select
                  id="memberId"
                  name="memberId"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
                >
                  <option value="" disabled>
                    Select member
                  </option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-300"
                  htmlFor="sessionId"
                >
                  Session
                </label>
                <select
                  id="sessionId"
                  name="sessionId"
                  required
                  defaultValue={latestSession?.id}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
                >
                  {sessions.map((session) => {
                    const date = new Date(session.date);
                    const label = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <option key={session.id} value={session.id}>
                        {label} · {session.title}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-300"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
                >
                  <option value={AttendanceStatus.PRESENT}>Present</option>
                  <option value={AttendanceStatus.LATE}>Late</option>
                  <option value={AttendanceStatus.ABSENT}>Absent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-300"
                  htmlFor="engagementScore"
                >
                  Engagement score (1–5)
                </label>
                <input
                  id="engagementScore"
                  name="engagementScore"
                  type="number"
                  min={1}
                  max={5}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
                  placeholder="e.g. 4"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:opacity-50"
            disabled={members.length === 0 || sessions.length === 0}
          >
            Save check-in
          </button>
        </form>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight">
              Recent check-ins
            </h2>
            <p className="text-xs text-slate-400">
              {recentAttendance.length} latest records
            </p>
          </div>
          <div className="mt-3 max-h-[420px] overflow-auto">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Member</th>
                  <th className="py-2 pr-4">Session</th>
                  <th className="py-2 pr-4 text-right">Status</th>
                  <th className="py-2 pr-4 text-right">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-xs text-slate-500"
                    >
                      No check-ins recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentAttendance.map((record) => {
                    const when = new Date(record.checkedInAt).toLocaleString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );

                    return (
                      <tr
                        key={record.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-2 pr-4 text-slate-200">{when}</td>
                        <td className="py-2 pr-4 text-slate-100">
                          {record.member.name}
                        </td>
                        <td className="py-2 pr-4 text-slate-300">
                          {record.session.title}
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-100">
                          {record.status}
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-100">
                          {record.engagementScore}
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
    </div>
  );
}
