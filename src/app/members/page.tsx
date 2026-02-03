import { prisma } from "@/lib/prisma";
import { toTitleCase } from "@/lib/text";
import { MemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

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
  revalidatePath("/");
  redirect("/members?status=member-created");
}

async function updateMember(formData: FormData) {
  "use server";

  const id = formData.get("id")?.toString();
  const rawName = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const role = (formData.get("role")?.toString() as MemberRole) ?? MemberRole.STUDENT;

  if (!id || !rawName) {
    return;
  }

  const name = toTitleCase(rawName);

  await prisma.member.update({
    where: { id },
    data: {
      name,
      email: email || null,
      role,
    },
  });

  revalidatePath("/members");
  revalidatePath("/");
  redirect("/members?status=member-updated");
}

async function deleteMember(formData: FormData) {
  "use server";

  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }

  await prisma.attendance.deleteMany({ where: { memberId: id } });

  await prisma.member.delete({
    where: { id },
  });

  revalidatePath("/members");
  revalidatePath("/");
  redirect("/members?status=member-deleted");
}
export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = params.status as string | undefined;
  const editId = params.edit as string | undefined;

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    include: { attendances: true },
  });

  const editingMember =
    editId ? members.find((m: any) => m.id === editId) ?? null : null;

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

      {status === "member-created" && (
        <div className="alert-auto-dismiss rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
          Member added successfully.
        </div>
      )}
      {status === "member-updated" && (
        <div className="alert-auto-dismiss rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
          Member updated successfully.
        </div>
      )}
      {status === "member-deleted" && (
        <div className="alert-auto-dismiss rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100">
          Member deleted successfully.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <form
          action={editingMember ? updateMember : createMember}
          className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5"
        >
          <h2 className="text-sm font-semibold tracking-tight">
            {editingMember ? "Edit member" : "Add member"}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Create a new student or team member that you can check in to
            sessions.
          </p>
          {editingMember && (
            <input type="hidden" name="id" value={editingMember.id} />
          )}

          <div className="mt-4 space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                defaultValue={editingMember?.name ?? ""}
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
                defaultValue={editingMember?.email ?? ""}
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
                defaultValue={editingMember?.role ?? MemberRole.STUDENT}
              >
                <option value={MemberRole.STUDENT}>Student</option>
                <option value={MemberRole.MEMBER}>Member</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400"
            >
              {editingMember ? "Update member" : "Save member"}
            </button>
            {editingMember && (
              <Link
                href="/members"
                className="rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-300"
              >
                Cancel
              </Link>
            )}
          </div>
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
                  <th className="py-2 pr-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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
                        <td className="py-2 pr-0 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/members?edit=${member.id}`}
                              className="rounded-full border border-slate-500/40 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-100 hover:border-emerald-400 hover:text-emerald-200"
                            >
                              Edit
                            </Link>
                            <form action={deleteMember}>
                              <input type="hidden" name="id" value={member.id} />
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
