"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const oauthError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(oauthError === "oauth_failed" ? "Google sign-in failed. Please try again." : "");

  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Fetch user profile to check admin status
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single();

        if (profile?.is_admin) {
          window.location.href = "/admin";
        } else {
          window.location.href = returnTo || "/account";
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (googleError) {
      setError(googleError.message);
    }
  };

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

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-sm font-semibold tracking-wide text-ink">
                Email Address
              </span>
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-bark/20 bg-white px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50 focus:border-espresso focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-semibold tracking-wide text-ink">
                  Password
                </span>
                <span title="Password reset coming soon" className="font-sans text-sm text-bark/60 cursor-not-allowed">
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-bark/20 bg-white px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50 focus:border-espresso focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-dark rounded-pill py-4 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gold/30" />
            <span className="font-sans text-xs uppercase tracking-widest text-bark">Or</span>
            <div className="h-px flex-1 bg-gold/30" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 rounded-pill border border-bark/20 bg-white py-4 font-sans text-sm font-semibold text-ink hover:bg-sand/40 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[720px] bg-cream flex items-center justify-center font-sans text-bark">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
