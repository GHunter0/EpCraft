"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_STORAGE_KEY = "epcraft-auth-user";
const PROFILE_STORAGE_KEY = "epcraft-profile";

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

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [acceptedTerms, setAcceptedTerms] =
    useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  function createMockAccount(
    accountEmail: string,
    accountName: string,
    loginMethod: "email" | "google",
  ) {
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        fullName: accountName,
        email: accountEmail,
        phone: "",
      }),
    );

    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        email: accountEmail,
        fullName: accountName,
        loginMethod,
        loggedInAt: new Date().toISOString(),
      }),
    );
  }

  function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (cleanName.length < 2) {
      setMessage("Please enter your full name.");
      return;
    }

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

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setMessage(
        "Please agree to the Terms of Service and Privacy Policy.",
      );
      return;
    }

    setSubmitting(true);

    createMockAccount(
      cleanEmail,
      cleanName,
      "email",
    );

    window.setTimeout(() => {
      router.push("/account");
    }, 350);
  }

  function handleGoogleRegister() {
    setMessage("");

    createMockAccount(
      "google.user@epcraft.com",
      "Google User",
      "google",
    );

    router.push("/account");
  }

  return (
    <main className="min-h-screen bg-[#fbf5ec] font-[Arial,sans-serif] text-[#30261f]">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[580px]">
            <Link
              href="/"
              className="mb-10 inline-block font-[Georgia,serif] text-[32px] font-semibold text-[#5a2e14] lg:hidden"
            >
              EpCraft
            </Link>

            <h1 className="font-[Georgia,serif] text-[42px] font-semibold leading-tight tracking-[-0.035em] text-[#4b2712] sm:text-[50px]">
              Create Your Account
            </h1>

            <form
              onSubmit={handleRegister}
              className="mt-10"
            >
              <label className="block">
                <span className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[#53301c]">
                  Full Name
                </span>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="John Tyson"
                  autoComplete="name"
                  className="mt-3 h-14 w-full rounded-lg border border-[#ddd6ce] bg-white px-5 text-[16px] outline-none transition placeholder:text-[#8a8d98] focus:border-[#8b5837] focus:ring-2 focus:ring-[#ead7c6]"
                />
              </label>

              <label className="mt-7 block">
                <span className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[#53301c]">
                  Email Address
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="john.t@gmail.com"
                  autoComplete="email"
                  className="mt-3 h-14 w-full rounded-lg border border-[#ddd6ce] bg-white px-5 text-[16px] outline-none transition placeholder:text-[#8a8d98] focus:border-[#8b5837] focus:ring-2 focus:ring-[#ead7c6]"
                />
              </label>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[#53301c]">
                    Password
                  </span>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="mt-3 h-14 w-full rounded-lg border border-[#ddd6ce] bg-white px-5 text-[16px] outline-none transition placeholder:text-[#777d89] focus:border-[#8b5837] focus:ring-2 focus:ring-[#ead7c6]"
                  />
                </label>

                <label className="block">
                  <span className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[#53301c]">
                    Confirm
                  </span>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="mt-3 h-14 w-full rounded-lg border border-[#ddd6ce] bg-white px-5 text-[16px] outline-none transition placeholder:text-[#777d89] focus:border-[#8b5837] focus:ring-2 focus:ring-[#ead7c6]"
                  />
                </label>
              </div>

              <label className="mt-7 flex cursor-pointer items-start gap-3 text-[13px] leading-5 text-[#554940]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(
                      event.target.checked,
                    )
                  }
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#5a2e14]"
                />

                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        "Terms of Service will be connected later.",
                      )
                    }
                    className="font-semibold text-[#5a321b] hover:underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        "Privacy Policy will be connected later.",
                      )
                    }
                    className="font-semibold text-[#5a321b] hover:underline"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>

              {message && (
                <p className="mt-5 rounded-lg bg-[#fff3ed] px-4 py-3 text-[13px] text-[#9a4939]">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-7 h-14 w-full rounded-full bg-[#5a2e14] px-8 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(90,46,20,0.18)] transition hover:bg-[#47230e] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {submitting
                  ? "Creating Account..."
                  : "Create Account"}
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
              onClick={handleGoogleRegister}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#d9d8da] bg-white px-8 text-[15px] font-medium text-[#302720] transition hover:bg-[#faf8f5]"
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            <p className="mt-12 text-center text-[15px] text-[#625850]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#5a321b] hover:underline"
              >
                Log In
              </Link>
            </p>

            <div className="mx-auto mt-12 h-px w-16 bg-[#dfcfbe]" />

            <p className="mt-8 text-center text-[12px] leading-5 text-[#8a7c72]">
              Registration currently uses frontend mock
              authentication until the backend account
              system is connected.
            </p>
          </div>
        </section>

        <section className="relative hidden min-h-screen overflow-hidden lg:block">
          <Image
            src="/epcraft/login/workshop-login.jpg"
            alt="Master artisan crafting a wooden chair"
            fill
            priority
            unoptimized
            sizes="48vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" />

          <Link
            href="/"
            className="absolute right-10 top-8 z-10 font-[Georgia,serif] text-[30px] font-semibold text-white drop-shadow"
          >
            EpCraft
          </Link>

          <div className="absolute bottom-12 left-12 right-10 z-10 text-white">
            <blockquote className="max-w-[590px] font-[Georgia,serif] text-[29px] italic leading-[1.35] drop-shadow sm:text-[34px]">
              “Wood is a living material, and every
              piece tells its own history.”
            </blockquote>

            <p className="mt-6 text-[12px] uppercase tracking-[0.23em] text-white/85">
              — Master Artisan
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}