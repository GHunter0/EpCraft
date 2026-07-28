import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="grid min-h-[720px] grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center bg-cream px-8 py-16">
        <div className="flex w-full max-w-md flex-col gap-10">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
            Create Your Account
          </h1>

          <form className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-sm font-semibold uppercase tracking-wide text-espresso">
                Full Name
              </span>
              <input
                placeholder="John Tyson"
                className="rounded-lg border border-border/60 bg-white px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-sans text-sm font-semibold uppercase tracking-wide text-espresso">
                Email Address
              </span>
              <input
                type="email"
                placeholder="john.t@gmail.com"
                className="rounded-lg border border-border/60 bg-white px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm font-semibold uppercase tracking-wide text-espresso">
                  Password
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-lg border border-border/60 bg-white px-4 py-3.5 font-sans text-base text-ink"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm font-semibold uppercase tracking-wide text-espresso">
                  Confirm
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-lg border border-border/60 bg-white px-4 py-3.5 font-sans text-base text-ink"
                />
              </label>
            </div>

            <label className="flex items-start gap-3 pt-2">
              <input type="checkbox" className="mt-0.5 h-5 w-5 rounded border-border/60" />
              <span className="font-sans text-xs text-bark">
                I agree to the <span className="text-espresso">Terms of Service</span> and{" "}
                <span className="text-espresso">Privacy Policy</span>.
              </span>
            </label>

            <button type="submit" className="btn-dark rounded-pill py-4">
              Create Account
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border/60" />
            <span className="font-sans text-xs uppercase tracking-widest text-bark">Or</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <button className="rounded-pill border border-border/60 bg-white py-4 font-sans text-base text-ink">
            Sign up with Google
          </button>

          <p className="text-center font-sans text-base text-bark">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-espresso">
              Log In
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-col justify-end overflow-hidden bg-gradient-to-br from-espresso to-ink p-16 md:flex">
        <div className="absolute inset-0 bg-black/20" />
        <p className="relative pb-6 font-serif text-2xl text-white">EpCraft</p>
        <blockquote className="relative font-serif text-3xl italic leading-snug text-white">
          &ldquo;Wood is a living material, and every piece tells its own history.&rdquo;
        </blockquote>
        <p className="relative pt-6 font-sans text-sm uppercase tracking-widest text-white/80">
          — Master Artisan
        </p>
      </div>
    </div>
  );
}
