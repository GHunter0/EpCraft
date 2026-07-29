"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_STORAGE_KEY = "epcraft-auth-user";

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.4-4H3.3v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.6 14a6 6 0 0 1 0-4V7.4H3.3A10 10 0 0 0 2 12c0 1.6.4 3.2 1.3 4.6L6.6 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 6c1.6 0 3 .5 4.1 1.6l3.1-3.1A10 10 0 0 0 3.3 7.4L6.6 10A5.8 5.8 0 0 1 12 6Z"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16.4 16.4 0 0 1-3 3.6M6.1 6.1C3.8 7.6 2.5 12 2.5 12s3.5 6 9.5 6a9.8 9.8 0 0 0 3.2-.5" />
        </>
      )}
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail.includes("@")) {
      setMessage(
        "Please enter a valid email address.",
      );
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    setSubmitting(true);

    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        email: cleanEmail,
        loginMethod: "email",
        loggedInAt: new Date().toISOString(),
      }),
    );

    window.setTimeout(() => {
      router.push("/account");
    }, 350);
  }

  function handleGoogleLogin() {
    setMessage("");

    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        email: "google.user@epcraft.com",
        loginMethod: "google",
        loggedInAt: new Date().toISOString(),
      }),
    );

    router.push("/account");
  }

  return (
    <main className="min-h-screen bg-[#fbf5ec] font-[Arial,sans-serif] text-[#2f261f]">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden min-h-screen overflow-hidden lg:block">
          <Image
            src="/epcraft/login/workshop-login.jpg"
            alt="Craftsperson working on a handcrafted wooden chair"
            fill
            priority
            unoptimized
            sizes="48vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />

          <Link
            href="/"
            className="absolute left-10 top-10 z-10 font-[Georgia,serif] text-[30px] font-semibold text-white drop-shadow"
          >
            EpCraft
          </Link>

          <div className="absolute bottom-16 left-12 right-12 z-10 max-w-[520px] text-white">
            <h1 className="font-[Georgia,serif] text-[58px] font-semibold leading-none tracking-[-0.05em]">
              EpCraft
            </h1>

            <p className="mt-6 max-w-[480px] text-[20px] leading-8 text-white/92">
              Where traditional craftsmanship meets the
              precision of the modern era.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[560px]">
            <Link
              href="/"
              className="mb-12 inline-block font-[Georgia,serif] text-[32px] font-semibold text-[#5a2e14] lg:hidden"
            >
              EpCraft
            </Link>

            <h2 className="font-[Georgia,serif] text-[42px] font-semibold leading-tight tracking-[-0.03em] text-[#2f261f] sm:text-[48px]">
              Welcome back
            </h2>

            <p className="mt-5 text-[17px] text-[#5f554e]">
              Sign in to continue your journey.
            </p>

            <form
              onSubmit={handleLogin}
              className="mt-10"
            >
              <label className="block">
                <span className="text-[15px] font-semibold tracking-[0.03em]">
                  Email Address
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="user@example.com"
                  autoComplete="email"
                  className="mt-3 h-14 w-full rounded-lg border border-[#ddd5cc] bg-white px-5 text-[16px] text-[#302720] outline-none transition placeholder:text-[#8a8994] focus:border-[#8b5837] focus:ring-2 focus:ring-[#ead7c6]"
                />
              </label>

              <div className="mt-7">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-[15px] font-semibold tracking-[0.03em]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        "Password recovery will be connected when authentication backend is ready.",
                      )
                    }
                    className="text-[14px] font-semibold text-[#5a321b] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative mt-3">
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-14 w-full rounded-lg border border-[#ddd5cc] bg-white px-5 pr-14 text-[16px] text-[#302720] outline-none transition placeholder:text-[#7f8490] focus:border-[#8b5837] focus:ring-2 focus:ring-[#ead7c6]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#72665d] hover:bg-[#f4ece3]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {message && (
                <p className="mt-4 rounded-lg bg-[#fff3ed] px-4 py-3 text-[13px] text-[#9a4939]">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-7 h-14 w-full rounded-full bg-[#5a2e14] px-8 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(90,46,20,0.18)] transition hover:bg-[#47230e] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {submitting
                  ? "Logging in..."
                  : "Log In"}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#e6d8c8]" />
              <span className="text-[13px] uppercase tracking-[0.15em] text-[#625850]">
                Or
              </span>
              <div className="h-px flex-1 bg-[#e6d8c8]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#d9d8da] bg-white px-8 text-[15px] font-semibold text-[#302720] transition hover:bg-[#faf8f5]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="mt-12 text-center text-[16px] text-[#625850]">
              New to EpCraft?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#5a321b] hover:underline"
              >
                Create an Account
              </Link>
            </p>

            <p className="mt-8 text-center text-[12px] leading-5 text-[#8a7c72]">
              This login currently uses frontend mock
              authentication until the backend login system
              is connected.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}