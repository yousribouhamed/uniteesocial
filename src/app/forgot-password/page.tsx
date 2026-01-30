"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen w-full bg-white overflow-hidden flex items-center justify-center">
        {/* Background decorative ellipses */}
        <div className="absolute -bottom-[200px] -left-[400px] w-[1714px] h-[1714px] rotate-[-30deg] pointer-events-none">
          <Image
            src="/img/ellipse-2.svg"
            alt=""
            fill
            className="object-contain opacity-50"
            aria-hidden="true"
          />
        </div>
        <div className="absolute -top-[600px] -right-[200px] w-[1714px] h-[1714px] rotate-[-30deg] pointer-events-none">
          <Image
            src="/img/ellipse-1.svg"
            alt=""
            fill
            className="object-contain opacity-50"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 bg-white border border-[#d5dde2] rounded-xl p-6 w-full max-w-[421px] mx-4 flex flex-col gap-6 shadow-sm text-center">
          <div className="flex justify-center">
            <Image
              src="/img/unitee-logo.png"
              alt="Unitee Social"
              width={64}
              height={64}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-[#22292f] text-xl font-semibold">Check your email</h1>
          <p className="text-[#668091] text-sm">
            We&apos;ve sent a password reset link to <strong>{email}</strong>.
            Click the link to reset your password.
          </p>
          <Link
            href="/login"
            className="text-[#3f52ff] text-sm font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden flex items-center justify-center">
      {/* Background decorative ellipses */}
      <div className="absolute -bottom-[200px] -left-[400px] w-[1714px] h-[1714px] rotate-[-30deg] pointer-events-none">
        <Image
          src="/img/ellipse-2.svg"
          alt=""
          fill
          className="object-contain opacity-50"
          aria-hidden="true"
        />
      </div>
      <div className="absolute -top-[600px] -right-[200px] w-[1714px] h-[1714px] rotate-[-30deg] pointer-events-none">
        <Image
          src="/img/ellipse-1.svg"
          alt=""
          fill
          className="object-contain opacity-50"
          aria-hidden="true"
        />
      </div>

      {/* Forgot password card */}
      <div className="relative z-10 bg-white border border-[#d5dde2] rounded-xl p-6 w-full max-w-[421px] mx-4 flex flex-col gap-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Image
            src="/img/unitee-logo.png"
            alt="Unitee Social"
            width={48}
            height={48}
            className="rounded-lg shrink-0"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-[#22292f] text-xl font-semibold leading-normal">
              Reset your password
            </h1>
            <p className="text-[#668091] text-sm font-semibold leading-normal">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4 w-full">
          {/* Email input */}
          <div className="flex flex-col gap-2">
            <label className="text-[#22292f] text-sm font-semibold leading-normal">
              Email
            </label>
            <div className="flex items-center gap-2 h-9 px-3 py-1 bg-white border border-[#d5dde2] rounded-lg focus-within:border-[#3f52ff] transition-colors">
              <Mail className="w-4 h-4 text-[#668091] shrink-0" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="flex-1 text-sm text-[#22292f] placeholder:text-[#668091] bg-transparent outline-none border-none p-0 focus:ring-0 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Send reset link button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#3f52ff] hover:bg-[#3545e0] disabled:bg-[#3f52ff]/70 transition-colors text-white text-sm font-medium leading-5 rounded-lg cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Back to login */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-[#668091] text-sm font-medium hover:text-[#22292f] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
