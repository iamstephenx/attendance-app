export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const error = params.error as string | undefined;
  const auth = params.auth as string | undefined;
  const from = (params.from as string | undefined) || "/";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-emerald-500/10">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Sign in
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Use the admin credentials to access the attendance dashboard.
        </p>

        {auth === "logout-success" && (
          <p className="alert-auto-dismiss mt-3 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
            You have been logged out.
          </p>
        )}

        {error === "invalid" && (
          <p className="alert-auto-dismiss mt-3 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100">
            Invalid username or password. Try again.
          </p>
        )}

        <form action="/api/login" method="POST" className="mt-4 space-y-3 text-sm">
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
