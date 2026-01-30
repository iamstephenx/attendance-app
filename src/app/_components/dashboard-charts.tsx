"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AttendanceTrendPoint = {
  label: string;
  present: number;
  engagement: number;
};

export type TopMemberPoint = {
  name: string;
  avgEngagement: number;
  attendedSessions: number;
};

type Props = {
  attendanceTrend: AttendanceTrendPoint[];
  topMembers: TopMemberPoint[];
};

export default function DashboardCharts({
  attendanceTrend,
  topMembers,
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Attendance & engagement over time
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Based on your most recent sessions.
            </p>
          </div>
        </div>
        <div className="mt-4 h-64 w-full">
          {attendanceTrend.length === 0 ? (
            <p className="text-center text-xs text-slate-500">
              No data yet. Once you start checking people in, you'll see trends
              here.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend} margin={{ left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2937"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderRadius: 8,
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#e5e7eb", marginBottom: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="present"
                  name="Present"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="engagement"
                  name="Engagement"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Most engaged members
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Average engagement score and sessions attended.
            </p>
          </div>
        </div>
        <div className="mt-4 h-64 w-full">
          {topMembers.length === 0 ? (
            <p className="text-center text-xs text-slate-500">
              No members with engagement data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMembers} margin={{ left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2937"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderRadius: 8,
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#e5e7eb", marginBottom: 4 }}
                />
                <Bar dataKey="avgEngagement" name="Avg engagement" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
