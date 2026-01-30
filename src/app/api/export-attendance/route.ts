import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    const records = await prisma.attendance.findMany({
      orderBy: { checkedInAt: "desc" },
      include: { member: true, session: true },
    });

    const header = [
      "member_name",
      "member_email",
      "session_title",
      "session_date",
      "status",
      "engagement_score",
      "checked_in_at",
    ];

    const escape = (value: string | null | undefined) => {
      const safe = value ?? "";
      return `"${safe.replace(/"/g, '""')}"`;
    };

    const lines = records.map((r) => {
      const sessionDate = r.session.date.toISOString();
      const checkedInAt = r.checkedInAt.toISOString();

      return [
        escape(r.member.name),
        escape(r.member.email),
        escape(r.session.title),
        escape(sessionDate),
        escape(r.status),
        escape(String(r.engagementScore)),
        escape(checkedInAt),
      ].join(",");
    });

    const csv = [header.join(","), ...lines].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=attendance_export.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting attendance records", error);

    return new Response("Failed to export attendance records", {
      status: 500,
    });
  }
}
