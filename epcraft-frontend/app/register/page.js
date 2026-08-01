"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const supabase = createClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAgreed) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Logged in immediately (email confirmation turned off)
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single();

        if (profile?.is_admin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/account";
        }
      } else if (data?.user) {
        // Confirmation email sent
        setSuccessMessage("Account created successfully! Please check your email to verify your account before logging in.");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      <div className="flex items-center justify-center bg-cream px-8 py-16">
        <div className="flex w-full max-w-md flex-col gap-10">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-espresso md:text-5xl">
              Create Your Account
            </h1>
            <p className="pt-2 font-sans text-base text-bark">Join EpCraft for a personalized woodworking experience.</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-sm font-semibold uppercase tracking-wide text-espresso">
                Full Name
              </span>
              <input
                type="text"
                required
                placeholder="John Tyson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-border/60 bg-white px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50 focus:border-espresso focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-sans text-sm font-semibold uppercase tracking-wide text-espresso">
                Email Address
              </span>
              <input
                type="email"
                required
                placeholder="john.t@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-border/60 bg-white px-4 py-3.5 font-sans text-base text-ink placeholder:text-bark/50 focus:border-espresso focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm font-semibold uppercase tracking-wide text-espresso">
                  Password
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border border-border/60 bg-white px-4 py-3.5 font-sans text-base text-ink focus:border-espresso focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-sans text-sm font-semibold uppercase tracking-wide text-espresso">
                  Confirm
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-lg border border-border/60 bg-white px-4 py-3.5 font-sans text-base text-ink focus:border-espresso focus:outline-none"
                />
              </label>
            </div>

            <label className="flex items-start gap-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-border/60 text-espresso focus:ring-espresso"
              />
              <span className="font-sans text-xs text-bark">
                I agree to the <span className="text-espresso font-semibold">Terms of Service</span> and{" "}
                <span className="text-espresso font-semibold">Privacy Policy</span>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-dark rounded-pill py-4 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border/60" />
            <span className="font-sans text-xs uppercase tracking-widest text-bark">Or</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="flex items-center justify-center gap-3 rounded-pill border border-border/60 bg-white py-4 font-sans text-base text-ink hover:bg-sand/40 transition-colors"
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[720px] bg-cream flex items-center justify-center font-sans text-bark">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
