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

import { registerUser } from "../../api/auth.js";


function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------
    // Client-side validation
    // -------------------------------

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const selectedRole =
        role === "student"
          ? "STUDENT"
          : "RECRUITER";

      await registerUser(
        name.trim(),
        email.trim(),
        password,
        selectedRole
      );

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      /*
       * Registration does not automatically log the user in.
       * The user will sign in normally after the account
       * has been created.
       */

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      console.error(
        "Registration failed:",
        err
      );

      setError(
        err.message ||
        "Unable to create your account. Please try again."
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

            {Array.from({ length: 36 }).map(
              (_, index) => (
                <span
                  key={index}
                  className="w-1 h-1 rounded-full bg-blue-400"
                />
              )
            )}

          </div>
        </div>

        {/* Decorative dots - bottom left */}

        <div className="absolute bottom-28 left-0 opacity-40">
          <div className="grid grid-cols-6 gap-3">

            {Array.from({ length: 30 }).map(
              (_, index) => (
                <span
                  key={index}
                  className="w-1 h-1 rounded-full bg-blue-400"
                />
              )
            )}

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
          RIGHT SIDE - REGISTRATION
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
              Get started
            </p>

            <h2 className="text-3xl sm:text-[34px] font-bold tracking-tight text-slate-900">
              Create your account
            </h2>

            <p className="text-slate-500 mt-2">
              Join CampusHire and access your recruitment workspace.
            </p>

          </div>


          {/* Registration Card */}

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

            <form onSubmit={handleRegister}>

              {/* Role selection */}

              <div className="mb-6">

                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Sign up as
                </label>

                <div className="grid grid-cols-2 gap-2">

                  {/* Student */}

                  <button
                    type="button"
                    onClick={() => {
                      setRole("student");
                      setError("");
                      setSuccess("");
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
                      setSuccess("");
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


              {/* Success message */}

              {success && (

                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">

                  <p className="text-sm leading-5 text-emerald-700">
                    {success}
                  </p>

                </div>

              )}


              {/* Full name */}

              <div className="mb-5">

                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Full name
                </label>

                <div className="relative">

                  <UserRound
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
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    required
                    disabled={loading}
                    autoComplete="name"
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
                      setSuccess("");
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

              <div className="mb-5">

                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Password
                </label>

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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    required
                    disabled={loading}
                    autoComplete="new-password"
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


              {/* Confirm password */}

              <div className="mb-7">

                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Confirm password
                </label>

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
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(
                        e.target.value
                      );
                      setError("");
                      setSuccess("");
                    }}
                    required
                    disabled={loading}
                    autoComplete="new-password"
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
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
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

                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}

                  </button>

                </div>

              </div>


              {/* Create account button */}

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
                      Creating account...
                    </span>

                  </>
                ) : (
                  <>

                    <span>
                      Create account
                    </span>

                    <ArrowRight className="w-4 h-4" />

                  </>
                )}

              </button>


              {/* Login link */}

              <div className="text-center mt-5">

                <span className="text-sm text-slate-500">
                  Already have an account?
                </span>{" "}

                <Link
                  to="/login"
                  className="
                    text-sm
                    font-semibold
                    text-blue-600
                    hover:text-blue-700
                    transition
                  "
                >
                  Sign in
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


export default Register;