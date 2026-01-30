import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString() ?? "";
  const from = formData.get("from")?.toString() || "/";

  if (email === "admin@gmail.com" && password === "admin") {
    const cookieStore = (await cookies()) as any;
    cookieStore.set("session", "admin", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    redirect(from || "/");
  }

  const search = new URLSearchParams();
  search.set("error", "invalid");
  if (from) {
    search.set("from", from);
  }

  redirect(`/login?${search.toString()}`);
}

export default function LoginPage({ searchParams }: any) {
  const error = searchParams?.error;
  const from = searchParams?.from || "/";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-emerald-500/10">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Sign in
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Use the admin credentials to access the attendance dashboard.
        </p>

        {error === "invalid" && (
          <p className="mt-3 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100">
            Invalid username or password. Try again.
          </p>
        )}

        <form action={login} className="mt-4 space-y-3 text-sm">
          <input type="hidden" name="from" value={from} />

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300" htmlFor="email">
              Username
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
            />
          </div>
          <div className="space-y-1">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="off"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400"
          >
            Log in
          </button>

          <p className="mt-3 text-[11px] text-slate-500">
            <br />
            Username: <span className="font-mono text-slate-300">admin@gmail.com</span>
            <br />
            Password: <span className="font-mono text-slate-300">admin</span>
          </p>
        </form>
      </div>
    </div>
  );
}
