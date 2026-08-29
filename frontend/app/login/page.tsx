"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  LockKeyhole,
  Mail,
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const BASE_URL = "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Invalid email or password."
        );
      }

      login(
        data.access_token,
        {
          user_id: data.user_id,
          name: data.name,
          email: data.email,
          role: data.role,
        }
      );

      if (data.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-gray-100">

      {/* =====================================================
          Background decoration
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className="
            absolute
            -left-32
            -top-32
            h-96
            w-96
            rounded-full
            bg-blue-200/40
            blur-3xl
            motion-safe:animate-pulse
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -right-32
            h-[28rem]
            w-[28rem]
            rounded-full
            bg-indigo-200/40
            blur-3xl
            motion-safe:animate-pulse
          "
        />

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-72
            w-72
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-blue-100/30
            blur-3xl
          "
        />

      </div>


      {/* =====================================================
          Main content
          ===================================================== */}

      <div className="relative flex h-full w-full items-center justify-center px-6">

        <div
          className="
            grid
            h-[calc(100dvh-32px)]
            max-h-[820px]
            w-full
            max-w-5xl
            overflow-hidden
            rounded-3xl
            border
            border-blue-100
            bg-white
            shadow-2xl
            transition-all
            duration-500
            lg:grid-cols-2
          "
        >

          {/* =================================================
              LEFT BRAND PANEL
              ================================================= */}

          <div
            className="
              relative
              hidden
              overflow-hidden
              bg-gradient-to-br
              from-blue-700
              via-blue-600
              to-indigo-700
              p-8
              lg:flex
              lg:flex-col
              lg:justify-between
              xl:p-10
            "
          >

            {/* Decorative circles */}

            <div
              className="
                absolute
                -right-20
                -top-20
                h-64
                w-64
                rounded-full
                border
                border-white/10
                transition-transform
                duration-1000
                hover:scale-110
              "
            />

            <div
              className="
                absolute
                -bottom-24
                -left-20
                h-72
                w-72
                rounded-full
                border
                border-white/10
                transition-transform
                duration-1000
                hover:scale-110
              "
            />

            <div className="relative">

              {/* =================================================
                  Logo
                  ================================================= */}

              <div className="mb-8 flex items-center gap-3">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/15
                    backdrop-blur-sm
                    transition-transform
                    duration-300
                    hover:scale-110
                  "
                >
                  <BrainCircuit
                    className="h-6 w-6 text-white"
                  />
                </div>

                <div>

                  <h1 className="text-lg font-bold text-white">
                    Zerodha AI
                  </h1>

                  <p className="text-xs text-blue-100">
                    Financial Intelligence
                  </p>

                </div>

              </div>


              {/* =================================================
                  Main heading
                  ================================================= */}

              <h2
                className="
                  max-w-md
                  text-4xl
                  font-bold
                  leading-tight
                  text-white
                "
              >
                Smarter insights for
                <br />
                your portfolio.
              </h2>


              <p
                className="
                  mt-5
                  max-w-md
                  text-sm
                  leading-6
                  text-blue-100
                "
              >
                Understand portfolio performance,
                concentration risk, market context,
                and AI-powered investment insights
                from one intelligent platform.
              </p>


              {/* =================================================
                  Feature list
                  ================================================= */}

              <div className="mt-8 space-y-4">

                {/* Portfolio Intelligence */}

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/10
                      transition-transform
                      duration-300
                      hover:scale-110
                    "
                  >
                    <BarChart3
                      className="h-4 w-4 text-white"
                    />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Portfolio Intelligence
                    </p>

                    <p className="text-xs text-blue-100">
                      Performance and allocation analysis
                    </p>

                  </div>

                </div>


                {/* AI-Powered Analysis */}

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/10
                      transition-transform
                      duration-300
                      hover:scale-110
                    "
                  >
                    <BrainCircuit
                      className="h-4 w-4 text-white"
                    />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      AI-Powered Analysis
                    </p>

                    <p className="text-xs text-blue-100">
                      Explainable portfolio insights
                    </p>

                  </div>

                </div>


                {/* Secure Access */}

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/10
                      transition-transform
                      duration-300
                      hover:scale-110
                    "
                  >
                    <ShieldCheck
                      className="h-4 w-4 text-white"
                    />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Secure Access
                    </p>

                    <p className="text-xs text-blue-100">
                      Role-based platform access
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                Left footer
                ================================================= */}

            <div className="relative text-xs text-blue-200">
              AI Financial Intelligence Platform
            </div>

          </div>


          {/* =================================================
              RIGHT LOGIN PANEL
              ================================================= */}

          <div
            className="
              flex
              min-h-0
              flex-col
              justify-center
              p-7
              sm:p-8
              lg:p-9
              xl:p-10
            "
          >

            {/* =================================================
                Mobile logo
                ================================================= */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <BrainCircuit
                  className="h-6 w-6 text-blue-600"
                />
              </div>

              <div>

                <h1 className="text-lg font-bold text-slate-900">
                  Zerodha AI
                </h1>

                <p className="text-xs text-slate-500">
                  Financial Intelligence
                </p>

              </div>

            </div>


            {/* =================================================
                Heading
                ================================================= */}

            <div className="mb-5">

              <p className="mb-2 text-sm font-semibold text-blue-600">
                Welcome!
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Access your portfolio, AI insights,
                recommendations, and analytics.
              </p>

            </div>


            {/* =================================================
                Login form
                ================================================= */}

            <form
              onSubmit={handleLogin}
              autoComplete="off"
              className="space-y-4"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="email"
                    name="login-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    autoComplete="off"
                    spellCheck={false}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-11
                      pr-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                </div>

              </div>


              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="password"
                    name="login-password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    autoComplete="new-password"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-11
                      pr-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                </div>

              </div>


              {/* =================================================
                  Error
                  ================================================= */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>

                </div>
              )}


              {/* =================================================
                  Submit
                  ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-blue-700
                  hover:shadow-lg
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:translate-y-0
                  disabled:bg-blue-300
                "
              >

                {loading ? (
                  <>
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
                  </>
                )}

              </button>

            </form>


            {/* =================================================
                Demo accounts
                ================================================= */}

            <div
              className="
                mt-6
                rounded-xl
                border
                border-blue-100
                bg-blue-50/50
                p-4
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-blue-200
                hover:shadow-sm
              "
            >

              <p
                className="
                  mb-3
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-blue-700
                "
              >
                Demo access
              </p>


              <div className="space-y-2 text-xs">

                <div className="flex items-center justify-between gap-3">

                  <span className="font-medium text-slate-700">
                    Varsha
                  </span>

                  <span className="text-slate-500">
                    varsha@demo.com / varsha123
                  </span>

                </div>


                <div className="flex items-center justify-between gap-3">

                  <span className="font-medium text-slate-700">
                    Rahul
                  </span>

                  <span className="text-slate-500">
                    rahul@demo.com / rahul123
                  </span>

                </div>


                <div className="flex items-center justify-between gap-3">

                  <span className="font-medium text-slate-700">
                    Admin
                  </span>

                  <span className="text-slate-500">
                    admin@demo.com / admin123
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                Footer
                ================================================= */}

            <p className="mt-4 text-center text-xs text-slate-400">
              Secure access to your financial intelligence workspace.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}