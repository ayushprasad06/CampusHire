import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserRound,
} from "lucide-react";

import { loginUser } from "../../api/auth.js";


function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      /*
       * The backend is the source of truth for the user's role.
       * We still keep the selected role in the UI so the user
       * can choose Student / Recruiter / Admin before login.
       */

      const loggedInRole = data?.user?.role?.toLowerCase();

      if (!loggedInRole) {
        throw new Error(
          "Login succeeded, but the server did not return a user role."
        );
      }

      /*
       * Make sure the selected role matches the account role.
       * This prevents someone from selecting Admin while logging
       * in with a Student account.
       */

      if (loggedInRole !== role) {
        localStorage.removeItem("campushire_token");
        localStorage.removeItem("campushire_user");

        throw new Error(
          `This account is registered as ${loggedInRole}, not ${role}.`
        );
      }

      /*
       * Redirect according to the role returned by the backend.
       */

      if (loggedInRole === "student") {
        navigate("/student/dashboard");
      } else if (loggedInRole === "recruiter") {
        navigate("/recruiter/dashboard");
      } else if (loggedInRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        throw new Error("Invalid user role received from server.");
      }

    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err.message || "Unable to sign in. Please check your credentials."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex bg-white overflow-x-hidden">

      {/* =========================================================
          LEFT SIDE - BRAND / MARKETING SECTION
      ========================================================= */}

      <div className="hidden lg:flex lg:w-[54%] relative overflow-hidden">

        {/* Main pastel gradient background */}

        <div
          className="
            absolute inset-0
            bg-gradient-to-br
            from-[#dbe7ff]
            via-[#f2eaff]
            to-[#ffdfe9]
          "
        />

        {/* Soft blue glow */}

        <div
          className="
            absolute
            -top-32
            -right-20
            w-[500px]
            h-[500px]
            rounded-full
            bg-blue-200/50
            blur-3xl
          "
        />

        {/* Soft pink glow */}

        <div
          className="
            absolute
            top-[35%]
            -right-32
            w-[450px]
            h-[450px]
            rounded-full
            bg-pink-200/50
            blur-3xl
          "
        />

        {/* Soft purple glow */}

        <div
          className="
            absolute
            -bottom-40
            left-[35%]
            w-[550px]
            h-[400px]
            rounded-full
            bg-indigo-200/60
            blur-3xl
          "
        />

        {/* Decorative curved shape - top right */}

        <div
          className="
            absolute
            -top-28
            right-[-110px]
            w-[430px]
            h-[430px]
            rounded-full
            bg-white/20
          "
        />

        {/* Decorative curved shape - bottom */}

        <div
          className="
            absolute
            -bottom-64
            right-[-80px]
            w-[560px]
            h-[330px]
            rounded-[50%]
            bg-indigo-300/20
            rotate-[-8deg]
          "
        />

        {/* Decorative dots - top right */}

        <div className="absolute top-28 right-12 opacity-50">
          <div className="grid grid-cols-6 gap-3">

            {Array.from({ length: 36 }).map((_, index) => (
              <span
                key={index}
                className="w-1 h-1 rounded-full bg-blue-400"
              />
            ))}

          </div>
        </div>

        {/* Decorative dots - bottom left */}

        <div className="absolute bottom-28 left-0 opacity-40">
          <div className="grid grid-cols-6 gap-3">

            {Array.from({ length: 30 }).map((_, index) => (
              <span
                key={index}
                className="w-1 h-1 rounded-full bg-blue-400"
              />
            ))}

          </div>
        </div>

        {/* Actual content */}

        <div className="relative z-10 flex flex-col w-full px-12 xl:px-16 py-12">

          {/* Logo */}

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                CampusHire
              </h1>

              <p className="text-xs text-slate-500">
                Campus Placement Portal
              </p>
            </div>

          </div>


          {/* Main content */}

          <div className="flex-1 flex flex-col justify-center max-w-[650px] -mt-4">

            {/* Small badge */}

            <div className="inline-flex self-start items-center gap-2 px-4 py-2 rounded-full bg-white/45 border border-white/60 backdrop-blur-sm text-blue-600 text-sm font-medium shadow-sm mb-7">

              <ShieldCheck className="w-4 h-4" />

              <span>Empowering Careers</span>

            </div>


            {/* Main heading */}

            <h2 className="text-5xl xl:text-[58px] font-bold tracking-tight leading-[1.08] text-slate-900">

              From Campus

              <br />

              to Career

              <br />

              <span className="text-blue-600">
                Opportunities.
              </span>

            </h2>


            {/* Description */}

            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-[570px]">

              A unified campus recruitment platform connecting students,
              companies, and placement administrators through a transparent
              and efficient hiring process.

            </p>


            {/* Role cards */}

            <div className="grid grid-cols-3 gap-4 mt-9 max-w-[650px]">

              {/* Student */}

              <div
                className="
                  bg-white/55
                  backdrop-blur-md
                  border
                  border-white/70
                  rounded-2xl
                  p-5
                  shadow-sm
                  hover:bg-white/70
                  transition
                "
              >

                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">

                  <UserRound className="w-5 h-5 text-blue-600" />

                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Students
                </h3>

                <p className="text-xs text-slate-500 leading-5 mt-2">
                  Explore and apply to verified opportunities
                </p>

              </div>


              {/* Recruiter */}

              <div
                className="
                  bg-white/55
                  backdrop-blur-md
                  border
                  border-white/70
                  rounded-2xl
                  p-5
                  shadow-sm
                  hover:bg-white/70
                  transition
                "
              >

                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-4">

                  <Building2 className="w-5 h-5 text-emerald-600" />

                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Recruiters
                </h3>

                <p className="text-xs text-slate-500 leading-5 mt-2">
                  Find talented candidates from top institutions
                </p>

              </div>


              {/* Placement Cell */}

              <div
                className="
                  bg-white/55
                  backdrop-blur-md
                  border
                  border-white/70
                  rounded-2xl
                  p-5
                  shadow-sm
                  hover:bg-white/70
                  transition
                "
              >

                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mb-4">

                  <ShieldCheck className="w-5 h-5 text-violet-600" />

                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Placement Cell
                </h3>

                <p className="text-xs text-slate-500 leading-5 mt-2">
                  Manage and streamline the recruitment process
                </p>

              </div>

            </div>

          </div>


          {/* Footer */}

          <div className="flex items-center gap-3">

            <div className="w-9 h-[2px] bg-blue-600" />

            <p className="text-xs text-slate-500">
              CampusHire © 2026 · Institutional Recruitment Platform
            </p>

          </div>

        </div>

      </div>


      {/* =========================================================
          RIGHT SIDE - LOGIN
      ========================================================= */}

      <div className="flex-1 bg-white flex items-center justify-center px-6 sm:px-10 py-10">

        <div className="w-full max-w-[475px]">

          {/* Mobile logo */}

          <div className="lg:hidden flex items-center gap-3 mb-10">

            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">

              <GraduationCap className="w-6 h-6 text-white" />

            </div>

            <div>

              <h1 className="text-xl font-bold text-slate-900">
                CampusHire
              </h1>

              <p className="text-xs text-slate-500">
                Campus Placement Portal
              </p>

            </div>

          </div>


          {/* Heading */}

          <div className="mb-8">

            <p className="text-sm font-semibold text-blue-600 mb-2">
              Welcome back
            </p>

            <h2 className="text-3xl sm:text-[34px] font-bold tracking-tight text-slate-900">
              Sign in to CampusHire
            </h2>

            <p className="text-slate-500 mt-2">
              Access your recruitment workspace.
            </p>

          </div>


          {/* Login Card */}

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              shadow-[0_8px_30px_rgba(15,23,42,0.08)]
              p-7
            "
          >

            <form onSubmit={handleLogin}>

              {/* Role selection */}

              <div className="mb-7">

                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Sign in as
                </label>

                <div className="grid grid-cols-3 gap-2">

                  {/* Student */}

                  <button
                    type="button"
                    onClick={() => {
                      setRole("student");
                      setError("");
                    }}
                    className={`
                      h-11
                      rounded-lg
                      text-sm
                      font-medium
                      border
                      transition-all
                      ${
                        role === "student"
                          ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    Student
                  </button>


                  {/* Recruiter */}

                  <button
                    type="button"
                    onClick={() => {
                      setRole("recruiter");
                      setError("");
                    }}
                    className={`
                      h-11
                      rounded-lg
                      text-sm
                      font-medium
                      border
                      transition-all
                      ${
                        role === "recruiter"
                          ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    Recruiter
                  </button>


                  {/* Admin */}

                  <button
                    type="button"
                    onClick={() => {
                      setRole("admin");
                      setError("");
                    }}
                    className={`
                      h-11
                      rounded-lg
                      text-sm
                      font-medium
                      border
                      transition-all
                      ${
                        role === "admin"
                          ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    Admin
                  </button>

                </div>

              </div>


              {/* Error message */}

              {error && (

                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm leading-5 text-red-700">
                    {error}
                  </p>

                </div>

              )}


              {/* Email */}

              <div className="mb-5">

                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      w-5
                      h-5
                      text-slate-400
                    "
                  />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="
                      w-full
                      h-12
                      pl-11
                      pr-4
                      border
                      border-slate-200
                      rounded-lg
                      outline-none
                      text-sm
                      text-slate-900
                      placeholder:text-slate-400
                      bg-white
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                      transition
                      disabled:bg-slate-50
                      disabled:cursor-not-allowed
                    "
                  />

                </div>

              </div>


              {/* Password */}

              <div className="mb-7">

                <div className="flex items-center justify-between mb-2">

                  <label className="text-sm font-semibold text-slate-800">
                    Password
                  </label>

                  <button
                    type="button"
                    className="
                      text-xs
                      font-semibold
                      text-blue-600
                      hover:text-blue-700
                      transition
                    "
                    onClick={() => {
                      setError(
                        "Password reset is not available yet."
                      );
                    }}
                  >
                    Forgot password?
                  </button>

                </div>


                <div className="relative">

                  <Lock
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      w-5
                      h-5
                      text-slate-400
                    "
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="
                      w-full
                      h-12
                      pl-11
                      pr-12
                      border
                      border-slate-200
                      rounded-lg
                      outline-none
                      text-sm
                      text-slate-900
                      placeholder:text-slate-400
                      bg-white
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                      transition
                      disabled:bg-slate-50
                      disabled:cursor-not-allowed
                    "
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="
                      absolute
                      right-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      hover:text-slate-600
                      transition
                      disabled:cursor-not-allowed
                    "
                  >

                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}

                  </button>

                </div>

              </div>


              {/* Sign in button */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  h-12
                  bg-blue-600
                  hover:bg-blue-700
                  active:bg-blue-800
                  disabled:bg-blue-400
                  disabled:cursor-not-allowed
                  text-white
                  rounded-lg
                  font-semibold
                  text-sm
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  shadow-sm
                  shadow-blue-600/20
                "
              >

                {loading ? (

                  <>

                    <span
                      className="
                        w-4
                        h-4
                        border-2
                        border-white/40
                        border-t-white
                        rounded-full
                        animate-spin
                      "
                    />

                    <span>
                      Signing in...
                    </span>

                  </>

                ) : (

                  <>

                    <span>
                      Sign in
                    </span>

                    <ArrowRight className="w-4 h-4" />

                  </>

                )}

              </button>


              {/* Registration option */}

              <div className="text-center mt-5">

                <span className="text-sm text-slate-500">
                  Don't have an account?
                </span>{" "}

                <Link
                  to="/register"
                  className="
                    text-sm
                    font-semibold
                    text-blue-600
                    hover:text-blue-700
                    transition
                  "
                >
                  Create one
                </Link>

              </div>

            </form>

          </div>


          {/* Bottom note */}

          <p className="text-center text-xs text-slate-400 mt-7">
            Authorized users only · CampusHire Recruitment System
          </p>

        </div>

      </div>

    </div>
  );
}


export default Login;