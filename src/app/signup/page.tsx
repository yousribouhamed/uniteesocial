"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
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
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Click the link to verify your account.
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

      {/* Signup card */}
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
              Create your account
            </h1>
            <p className="text-[#668091] text-sm font-semibold leading-normal">
              Join Unitee Social today
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
        <form onSubmit={handleEmailSignup} className="flex flex-col gap-4 w-full">
          {/* Full Name input */}
          <div className="flex flex-col gap-2">
            <label className="text-[#22292f] text-sm font-semibold leading-normal">
              Full Name
            </label>
            <div className="flex items-center gap-2 h-9 px-3 py-1 bg-white border border-[#d5dde2] rounded-lg focus-within:border-[#3f52ff] transition-colors">
              <User className="w-4 h-4 text-[#668091] shrink-0" />
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="flex-1 text-sm text-[#22292f] placeholder:text-[#668091] bg-transparent outline-none border-none p-0 focus:ring-0 disabled:opacity-50"
              />
            </div>
          </div>

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

          {/* Password input */}
          <div className="flex flex-col gap-2">
            <label className="text-[#22292f] text-sm font-semibold leading-normal">
              Password
            </label>
            <div className="flex items-center gap-2 h-9 px-3 py-1 bg-white border border-[#d5dde2] rounded-lg focus-within:border-[#3f52ff] transition-colors">
              <Lock className="w-4 h-4 text-[#668091] shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="flex-1 text-sm text-[#22292f] placeholder:text-[#668091] bg-transparent outline-none border-none p-0 focus:ring-0 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 text-[#668091] hover:text-[#22292f] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="flex flex-col gap-2">
            <label className="text-[#22292f] text-sm font-semibold leading-normal">
              Confirm Password
            </label>
            <div className="flex items-center gap-2 h-9 px-3 py-1 bg-white border border-[#d5dde2] rounded-lg focus-within:border-[#3f52ff] transition-colors">
              <Lock className="w-4 h-4 text-[#668091] shrink-0" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="flex-1 text-sm text-[#22292f] placeholder:text-[#668091] bg-transparent outline-none border-none p-0 focus:ring-0 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="shrink-0 text-[#668091] hover:text-[#22292f] transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Sign up button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#3f52ff] hover:bg-[#3545e0] disabled:bg-[#3f52ff]/70 transition-colors text-white text-sm font-medium leading-5 rounded-lg cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Divider + Google + Login */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* OR divider */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-[#d5dde2]" />
            <span className="text-[#22292f] text-sm font-semibold leading-normal">
              OR
            </span>
            <div className="flex-1 h-px bg-[#d5dde2]" />
          </div>

          {/* Google sign up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2 bg-white border border-[#d5dde2] rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Image
              src="/img/google-icon.svg"
              alt="Google"
              width={18}
              height={18}
            />
            <span className="text-[#22292f] text-sm font-semibold leading-5">
              Sign up with Google
            </span>
          </button>

          {/* Login link */}
          <p className="text-[#859bab] text-sm font-semibold leading-normal">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1315c0] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
