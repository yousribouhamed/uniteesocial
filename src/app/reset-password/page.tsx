"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin/users");
    }
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

      {/* Reset password card */}
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
              Set new password
            </h1>
            <p className="text-[#668091] text-sm font-semibold leading-normal">
              Enter your new password below
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
        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 w-full">
          {/* New Password input */}
          <div className="flex flex-col gap-2">
            <label className="text-[#22292f] text-sm font-semibold leading-normal">
              New Password
            </label>
            <div className="flex items-center gap-2 h-9 px-3 py-1 bg-white border border-[#d5dde2] rounded-lg focus-within:border-[#3f52ff] transition-colors">
              <Lock className="w-4 h-4 text-[#668091] shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
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
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                placeholder="Confirm new password"
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
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Update button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#3f52ff] hover:bg-[#3545e0] disabled:bg-[#3f52ff]/70 transition-colors text-white text-sm font-medium leading-5 rounded-lg cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        <Link
          href="/login"
          className="text-center text-[#668091] text-sm font-medium hover:text-[#22292f] transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
