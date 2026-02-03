import { prisma } from "@/lib/prisma";
import { toTitleCase } from "@/lib/text";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

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
  redirect("/sessions?status=session-created");
}

async function deleteSession(formData: FormData) {
  "use server";

  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }

  await prisma.attendance.deleteMany({ where: { sessionId: id } });

  await prisma.session.delete({
    where: { id },
  });

  revalidatePath("/sessions");
  revalidatePath("/");
  redirect("/sessions?status=session-deleted");
}

async function updateSession(formData: FormData) {
  "use server";

  const id = formData.get("id")?.toString();
  const rawTitle = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const dateStr = formData.get("date")?.toString();

  if (!id || !rawTitle || !dateStr) {
    return;
  }

  const title = toTitleCase(rawTitle);
  const date = new Date(dateStr);

  await prisma.session.update({
    where: { id },
    data: {
      title,
      description: description || null,
      date,
    },
  });

  revalidatePath("/sessions");
  revalidatePath("/");
  redirect("/sessions?status=session-updated");
}

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = params.status as string | undefined;
  const editId = params.edit as string | undefined;
  const auth = params.auth as string | undefined;

  const sessions = await prisma.session.findMany({
    orderBy: { date: "desc" },
    include: { attendances: true },
  });

  const editingSession =
    editId ? sessions.find((s: any) => s.id === editId) ?? null : null;

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

      {auth === "login-success" && (
        <div className="alert-auto-dismiss rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
          Logged in successfully.
        </div>
      )}

      {status === "session-created" && (
        <div className="alert-auto-dismiss rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
          Session created successfully.
        </div>
      )}
      {status === "session-updated" && (
        <div className="alert-auto-dismiss rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
          Session updated successfully.
        </div>
      )}
      {status === "session-deleted" && (
        <div className="alert-auto-dismiss rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100">
          Session deleted successfully.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <form
          action={editingSession ? updateSession : createSession}
          className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5"
        >
          <h2 className="text-sm font-semibold tracking-tight">Create session</h2>
          <p className="mt-1 text-xs text-slate-400">
            Add a new class or meeting before you start checking people in.
          </p>
          {editingSession && (
            <input type="hidden" name="id" value={editingSession.id} />
          )}

          <div className="mt-4 space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                defaultValue={editingSession?.title ?? ""}
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
                defaultValue={
                  editingSession
                    ? new Date(editingSession.date).toISOString().slice(0, 16)
                    : ""
                }
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
                defaultValue={editingSession?.description ?? ""}
                className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring capitalize"
                placeholder="Topic, objectives, or other important context."
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400"
            >
              {editingSession ? "Update session" : "Save session"}
            </button>
            {editingSession && (
              <Link
                href="/sessions"
                className="rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-300"
              >
                Cancel
              </Link>
            )}
          </div>
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
                  <th className="py-2 pr-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
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
                        <td className="py-2 pr-0 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/sessions?edit=${session.id}`}
                              className="rounded-full border border-slate-500/40 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-100 hover:border-emerald-400 hover:text-emerald-200"
                            >
                              Edit
                            </Link>
                            <form action={deleteSession}>
                              <input type="hidden" name="id" value={session.id} />
                              <button
                                type="submit"
                                className="rounded-full border border-red-500/40 bg-red-950/40 px-2.5 py-1 text-[11px] font-medium text-red-100 hover:bg-red-500/20"
                              >
                                Delete
                              </button>
                            </form>
                          </div>
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
