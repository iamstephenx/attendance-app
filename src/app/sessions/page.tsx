import { prisma } from "@/lib/prisma";
import { toTitleCase } from "@/lib/text";
import { revalidatePath } from "next/cache";

async function createSession(formData: FormData) {
  "use server";

  const rawTitle = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const dateStr = formData.get("date")?.toString();

  if (!rawTitle || !dateStr) {
    return;
  }

  const title = toTitleCase(rawTitle);
  const date = new Date(dateStr);

  await prisma.session.create({
    data: {
      title,
      description: description || null,
      date,
    },
  });

  revalidatePath("/sessions");
  revalidatePath("/");
}

export default async function SessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { date: "desc" },
    include: { attendances: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Sessions
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Log the classes or meetings where you will track attendance and
            engagement.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <form
          action={createSession}
          className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5"
        >
          <h2 className="text-sm font-semibold tracking-tight">Create session</h2>
          <p className="mt-1 text-xs text-slate-400">
            Add a new class or meeting before you start checking people in.
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring capitalize"
                placeholder="e.g. Week 1 - Orientation"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="date">
                Date & time
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-slate-300"
                htmlFor="description"
              >
                Notes (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring capitalize"
                placeholder="Topic, objectives, or other important context."
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400"
          >
            Save session
          </button>
        </form>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Session list</h2>
            <p className="text-xs text-slate-400">{sessions.length} total</p>
          </div>
          <div className="mt-3 max-h-[420px] overflow-auto">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Notes</th>
                  <th className="py-2 pr-4 text-right">Present</th>
                  <th className="py-2 pr-4 text-right">Avg engagement</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-xs text-slate-500"
                    >
                      No sessions yet. Use the form on the left to add your
                      first one.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => {
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
                        <td className="py-2 pr-4 text-slate-100">
                          {session.title}
                        </td>
                        <td className="py-2 pr-4 text-slate-300">
                          {session.description || "-"}
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
    </div>
  );
}
