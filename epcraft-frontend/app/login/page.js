import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="grid min-h-[720px] grid-cols-1 md:grid-cols-2">
      <div className="relative hidden items-end bg-gradient-to-br from-espresso to-ink p-16 md:flex">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex flex-col gap-4 text-white">
          <h1 className="font-serif text-5xl font-bold tracking-tight">EpCraft</h1>
          <p className="max-w-sm text-lg opacity-90">
            Where traditional craftsmanship meets the precision of the modern era.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream px-8 py-16">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div>
            <h2 className="font-serif text-4xl font-semibold text-ink">Welcome back</h2>
            <p className="pt-2 font-sans text-base text-bark">Sign in to continue your journey.</p>
          </div>

          <form className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-sm font-semibold tracking-wide text-ink">
                Email Address
              </span>
              <input
                type="email"
                placeholder="user@example.com"
                className="rounded-lg border border-bark/20 bg-white px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50"
              />
            </label>

            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-semibold tracking-wide text-ink">
                  Password
                </span>
                <Link href="/forgot-password" className="font-sans text-sm font-semibold text-espresso">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="rounded-lg border border-bark/20 bg-white px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50"
              />
            </label>

            <button type="submit" className="btn-dark rounded-pill py-4">
              Log In
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gold/30" />
            <span className="font-sans text-xs uppercase tracking-widest text-bark">Or</span>
            <div className="h-px flex-1 bg-gold/30" />
          </div>

          <button className="rounded-pill border border-bark/20 bg-white py-4 font-sans text-sm font-semibold text-ink">
            Continue with Google
          </button>

          <p className="text-center font-sans text-base text-bark">
            New to EpCraft?{" "}
            <Link href="/register" className="font-semibold text-espresso">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
