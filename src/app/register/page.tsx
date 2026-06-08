"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [nameAriaInvalid, setNameAriaInvalid] = useState(false);
  const [emailAriaInvalid, setEmailAriaInvalid] = useState(false);
  const [passwordAriaInvalid, setPasswordAriaInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password rules validation states
  const [passwordValue, setPasswordValue] = useState("");
  const [passRules, setPassRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Validate password rules in real-time
  useEffect(() => {
    setPassRules({
      length: passwordValue.length >= 8,
      uppercase: /[A-Z]/.test(passwordValue),
      number: /[0-9]/.test(passwordValue),
      special: /[\W_]/.test(passwordValue),
    });
  }, [passwordValue]);

  const handleInputBlur = (
    ref: React.RefObject<HTMLInputElement | null>,
    setAriaInvalid: (val: boolean) => void
  ) => {
    if (ref.current) {
      setAriaInvalid(!ref.current.validity.valid);
    }
  };

  const handleInputChange = (
    ref: React.RefObject<HTMLInputElement | null>,
    setAriaInvalid: (val: boolean) => void
  ) => {
    if (ref.current) {
      if (ref.current.validity.valid) {
        setAriaInvalid(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameRef.current && emailRef.current && passwordRef.current) {
      const isNameValid = nameRef.current.validity.valid;
      const isEmailValid = emailRef.current.validity.valid;
      const isPasswordValid = passwordRef.current.validity.valid;

      setNameAriaInvalid(!isNameValid);
      setEmailAriaInvalid(!isEmailValid);
      setPasswordAriaInvalid(!isPasswordValid);

      if (isNameValid && isEmailValid && isPasswordValid) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          alert("Account created successfully! (Simulation)");
        }, 1500);
      }
    }
  };

  const isPasswordStrong =
    passRules.length && passRules.uppercase && passRules.number && passRules.special;

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* Left side: Premium Blue Graphic Pane (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-tr from-blue-700 via-indigo-700 to-cyan-500 lg:flex lg:flex-col lg:justify-between lg:p-16">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-white/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-400/20 blur-[120px]"></div>

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 font-bold text-lg shadow-lg">
              C
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              CSMS Portal
            </span>
          </Link>
        </div>

        {/* Center Quote/Feature Card */}
        <div className="relative z-10 my-auto max-w-md">
          <div className="rounded-2xl border border-white/20 bg-white/15 p-8 backdrop-blur-md shadow-2xl">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/10">
              Enterprise Grade
            </span>
            <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white">
              Create an account and start automating today.
            </h2>
            <p className="mt-4 text-base text-blue-50 leading-relaxed">
              Unlock access to secure API infrastructure orchestration, multi-region database replication, and custom security configuration suites.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-blue-100/60">
          &copy; {new Date().getFullYear()} CSMS Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Clean Register Form */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo mobile-only */}
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base shadow-md">
              C
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              CSMS
            </span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Create an account
            </h1>
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors underline decoration-blue-600/30 underline-offset-4"
              >
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="mt-10 space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>
              <input
                ref={nameRef}
                type="text"
                id="name"
                name="name"
                required
                placeholder="John Doe"
                autoComplete="name"
                aria-invalid={nameAriaInvalid ? "true" : undefined}
                onBlur={() => handleInputBlur(nameRef, setNameAriaInvalid)}
                onChange={() => handleInputChange(nameRef, setNameAriaInvalid)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
              <div className="error-msg text-xs text-red-600 flex items-center gap-1.5 animate-fadeIn mt-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Your name is required.
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <span id="email-hint" className="text-xs text-slate-400">
                  Format: name@domain.com
                </span>
              </div>
              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                required
                placeholder="name@domain.com"
                autoComplete="username"
                aria-describedby="email-hint"
                aria-invalid={emailAriaInvalid ? "true" : undefined}
                onBlur={() => handleInputBlur(emailRef, setEmailAriaInvalid)}
                onChange={() => handleInputChange(emailRef, setEmailAriaInvalid)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
              <div className="error-msg text-xs text-red-600 flex items-center gap-1.5 animate-fadeIn mt-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Please enter a valid email address.
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              {/* Password complexity checklist box (displayed above input so keyboard doesn't cover it) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <p className="font-semibold text-slate-600 mb-2">Password Requirements:</p>
                <ul className="grid grid-cols-2 gap-2 text-slate-400">
                  <li className={`flex items-center gap-1.5 transition-colors ${passRules.length ? "text-green-600 font-semibold" : ""}`}>
                    <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] ${passRules.length ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {passRules.length ? "✓" : "•"}
                    </span>
                    8+ Characters
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors ${passRules.uppercase ? "text-green-600 font-semibold" : ""}`}>
                    <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] ${passRules.uppercase ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {passRules.uppercase ? "✓" : "•"}
                    </span>
                    1 Upper Case
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors ${passRules.number ? "text-green-600 font-semibold" : ""}`}>
                    <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] ${passRules.number ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {passRules.number ? "✓" : "•"}
                    </span>
                    1 Number
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors ${passRules.special ? "text-green-600 font-semibold" : ""}`}>
                    <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] ${passRules.special ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {passRules.special ? "✓" : "•"}
                    </span>
                    1 Symbol
                  </li>
                </ul>
              </div>

              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
                  minLength={8}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={passwordValue}
                  aria-invalid={passwordAriaInvalid ? "true" : undefined}
                  onBlur={() => handleInputBlur(passwordRef, setPasswordAriaInvalid)}
                  onChange={(e) => {
                    setPasswordValue(e.target.value);
                    handleInputChange(passwordRef, setPasswordAriaInvalid);
                  }}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
                {/* Show/Hide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <div className="error-msg text-xs text-red-600 flex items-center gap-1.5 animate-fadeIn mt-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Password does not meet the safety requirements.
                </div>
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-slate-500 leading-normal">
                I agree to the{" "}
                <a href="#terms" className="text-blue-600 hover:text-blue-500 underline underline-offset-2 hover:decoration-blue-500">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#privacy" className="text-blue-600 hover:text-blue-500 underline underline-offset-2 hover:decoration-blue-500">
                  Privacy Policy
                </a>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordStrong}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
