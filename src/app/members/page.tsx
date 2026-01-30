import { prisma } from "@/lib/prisma";
import { toTitleCase } from "@/lib/text";
import { MemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function createMember(formData: FormData) {
  "use server";

  const rawName = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const role = (formData.get("role")?.toString() as MemberRole) ?? MemberRole.STUDENT;

  if (!rawName) {
    return;
  }

  const name = toTitleCase(rawName);

  await prisma.member.create({
    data: {
      name,
      email: email || null,
      role,
    },
  });

  revalidatePath("/members");
}

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    include: { attendances: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Members
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage the people in your class or team and see their engagement.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <form
          action={createMember}
          className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5"
        >
          <h2 className="text-sm font-semibold tracking-tight">Add member</h2>
          <p className="mt-1 text-xs text-slate-400">
            Create a new student or team member that you can check in to
            sessions.
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring capitalize"
                placeholder="e.g. Juan Dela Cruz"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="email">
                Email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
                defaultValue={MemberRole.STUDENT}
              >
                <option value={MemberRole.STUDENT}>Student</option>
                <option value={MemberRole.MEMBER}>Member</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400"
          >
            Save member
          </button>
        </form>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Member list</h2>
            <p className="text-xs text-slate-400">{members.length} total</p>
          </div>
          <div className="mt-3 max-h-[420px] overflow-auto">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4 text-right">Sessions attended</th>
                  <th className="py-2 pr-4 text-right">Avg engagement</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-xs text-slate-500"
                    >
                      No members yet. Add your first member using the form on
                      the left.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const presentAttendances = member.attendances.filter(
                      (a) => a.status === "PRESENT",
                    );
                    const avgEngagement =
                      member.attendances.length === 0
                        ? 0
                        :
                          member.attendances.reduce(
                            (sum, a) => sum + a.engagementScore,
                            0,
                          ) / member.attendances.length;

                    return (
                      <tr
                        key={member.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-2 pr-4 text-slate-100">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">
                              {member.name}
                            </span>
                            {member.email && (
                              <span className="text-[11px] text-slate-400">
                                {member.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-slate-200">
                          {member.role === MemberRole.STUDENT ? "Student" : "Member"}
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-100">
                          {presentAttendances.length}
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-100">
                          {avgEngagement.toFixed(2)}
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
