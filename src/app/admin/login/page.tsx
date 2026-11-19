"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import loginBg from "@/app/assets/4.jpg";
import { useRouter } from "next/navigation";
import { adminGet, adminPost, ApiError } from "@/lib/admin/api";
import type { AdminUser } from "@/lib/admin/types";
import { Button } from "@/components/admin/ui";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGet<{ user: AdminUser }>("/admin/auth/me")
      .then(() => router.replace("/admin"))
      .catch(() => null);
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminPost<{ user: AdminUser }>("/admin/auth/login", { email, password });
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid email or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-[#000000] text-white  selection:text-white">
      {/* ================= LEFT SIDE: UNSPLASH HERO IMAGE & BRANDING ================= */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex xl:w-[55%]">
        {/* Background Image: src/app/assets/4.jpg */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={loginBg}
            alt="Royal Mansion Resort Villa"
            fill
            priority
            className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
          />
        </div>

        {/* Sophisticated Luxury Dark Green / Black Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/85 to-zinc-900/70" />
<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(161,161,170,0.12),transparent_60%)]" />

        {/* Top Branding Header */}
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center ">
              <Image
                src="/logo.png"
                alt="Royal Mansion Resort Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-widest uppercase text-zinc-300">
                Royal Mansion Resort & Villa
              </p>
              <p className="text-lg text-neutral-300/80">Management Console & PMS</p>
            </div>
          </div>
        </div>

        {/* Center / Bottom Hero Content */}
        <div className="relative z-10 p-12">
          <div className="max-w-xl space-y-6">
            

            <h2 className="font-serif text-3xl font-normal leading-tight text-white md:text-4xl">
              Elevating Guest Journeys with Seamless Villa Management.
            </h2>

            <p className="text-sm leading-relaxed text-emerald-100/80">
              Direct access to live reservation schedules, automated availability engine, rates & packages, and property staff operations.
            </p>

            {/* Feature Pills */}
            {/* <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-neutral-200">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <HiOutlineShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Encrypted Staff Authentication</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <span className="text-amber-400">📍</span>
                <span>Pussallawa, Sri Lanka</span>
              </div>
            </div> */}
          </div>

          <div className="mt-12 border-t border-white/10 pt-4 text-xs text-neutral-400">
            © 2026 Royal Mansion Resort Villa. Internal staff management system.
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
      <div className="relative flex w-full flex-col justify-between p-6 sm:p-12 lg:w-1/2 xl:w-[45%] bg-[#08110b] dark:bg-[#070b0e]">
        {/* Top bar with Back to Website link */}
        <div className="flex items-center justify-between pb-6">
          <Link
            href="/book"
            className="group inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:bg-white/5 hover:text-emerald-300"
          >
            <HiOutlineArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Guest Booking</span>
          </Link>

          
        </div>

        {/* Center Login Card */}
        <div className="mx-auto w-full max-w-md py-8">
          {/* Mobile Logo / Brand (Visible when left side is hidden) */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2">
                <Image
                  src="/logo.png"
                  alt="Royal Mansion Resort Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Royal Mansion Resort</h1>
                <p className="text-xs text-emerald-300">Staff Management Console</p>
              </div>
            </div>
          </div>

          {/* Title Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Please enter your authorized staff credentials to access hotel operations, bookings, and billing.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" style={{ colorScheme: "dark" }}>
            <div>
              <label htmlFor="staff-email" className="mb-2 block text-sm font-semibold text-white tracking-wide">
                Staff Email Address <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <HiOutlineEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
                <input
                  id="staff-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="admin@royalmansionresorts.com"
                  className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pl-11 pr-4 text-sm font-medium text-white placeholder:text-neutral-400 shadow-inner transition-all hover:border-white/30 focus:border-emerald-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="staff-password" className="mb-2 block text-sm font-semibold text-white tracking-wide">
                Password <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
                <input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pl-11 pr-12 text-sm font-medium text-white placeholder:text-neutral-400 shadow-inner transition-all hover:border-white/30 focus:border-emerald-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="h-4 w-4" />
                  ) : (
                    <HiOutlineEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300"
                role="alert"
              >
                <span className="mt-0.5 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="mt-6 h-11 w-full bg-emerald-600 font-medium text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 active:scale-[0.99] transition-all"
            >
              {loading ? "Verifying Credentials…" : "Sign In to Management Console"}
            </Button>
          </form>

          {/* Security Notice */}
          {/* <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <HiOutlineShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Role-based access strictly enforced</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500 leading-tight">
              All logins and administrative actions are cryptographically signed and logged for audit compliance.
            </p>
          </div> */}
        </div>

        {/* Footer info */}
        <div className="pt-6 text-center text-xs text-neutral-500">
          Trouble signing in? Contact resort administration or tech support.
        </div>
      </div>
    </main>
  );
}
