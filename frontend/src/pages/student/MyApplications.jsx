import React, { useEffect, useMemo, useState } from "react";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  UserRound,
  LogOut,
  ChevronDown,
  GraduationCap,
  Search,
  CheckCircle2,
  Clock3,
  Trophy,
  XCircle,
  ChevronRight,
  CalendarDays,
  MoreHorizontal,
  Menu,
  X,
  MapPin,
  ExternalLink,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, logoutUser } from "../../api/auth.js";

import {
  getMyApplicationById,
  getMyApplications,
} from "../../api/applications.js";

const PIPELINE_STAGES = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
];

const STATUS_LABELS = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

const FILTERS = [
  { value: "ALL", label: "All Applications" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "SELECTED", label: "Selected" },
  { value: "REJECTED", label: "Rejected" },
];

const getStatusStyle = (status) => {
  switch (status) {
    case "SELECTED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "SHORTLISTED":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "INTERVIEW":
      return "bg-violet-50 text-violet-700 border-violet-100";

    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-100";

    case "UNDER_REVIEW":
      return "bg-amber-50 text-amber-700 border-amber-100";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatStatus = (status) => {
  return STATUS_LABELS[status] || status || "Unknown";
};

const getInitials = (name) => {
  if (!name) return "ST";

  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "ST";
};

const getCompanyInitial = (companyName) => {
  return companyName?.trim()?.charAt(0)?.toUpperCase() || "C";
};

const getCompanyLogoStyle = (companyName) => {
  const styles = [
    "bg-orange-100 text-orange-600",
    "bg-blue-100 text-blue-600",
    "bg-emerald-100 text-emerald-600",
    "bg-purple-100 text-purple-600",
    "bg-indigo-100 text-indigo-600",
    "bg-sky-100 text-sky-600",
  ];

  const charCode = companyName?.trim()?.charCodeAt(0) || 0;

  return styles[charCode % styles.length];
};

const getCurrentStageIndex = (status) => {
  return PIPELINE_STAGES.indexOf(status);
};

const getStageState = (stage, currentStatus) => {
  if (currentStatus === "REJECTED") return "future";

  const currentIndex = getCurrentStageIndex(currentStatus);
  const stageIndex = PIPELINE_STAGES.indexOf(stage);

  if (currentIndex === -1) return "future";
  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "current";

  return "future";
};

const getStageIcon = (stage, state) => {
  if (stage === "SELECTED") {
    return <Trophy className="h-3.5 w-3.5" />;
  }

  if (state === "completed" || state === "current") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  return <Clock3 className="h-3.5 w-3.5" />;
};

function MyApplications() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyApplications();

        if (cancelled) return;

        setApplications(
          Array.isArray(data?.applications) ? data.applications : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error("My applications error:", err);

        setError(
          err.message || "Unable to load your applications."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const statusMatches =
        activeFilter === "ALL" || application?.status === activeFilter;

      const company =
        application?.job?.company?.companyName || "";

      const title = application?.job?.title || "";

      const location = application?.job?.location || "";

      const searchMatches =
        !normalizedSearch ||
        company.toLowerCase().includes(normalizedSearch) ||
        title.toLowerCase().includes(normalizedSearch) ||
        location.toLowerCase().includes(normalizedSearch);

      return statusMatches && searchMatches;
    });
  }, [applications, activeFilter, searchTerm]);

  const totalApplications = applications.length;

  const underReviewCount = applications.filter(
    (application) => application?.status === "UNDER_REVIEW"
  ).length;

  const shortlistedCount = applications.filter(
    (application) => application?.status === "SHORTLISTED"
  ).length;

  const offerCount = applications.filter(
    (application) => application?.status === "SELECTED"
  ).length;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const openApplicationDetails = async (applicationId) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedApplication(null);

      const data = await getMyApplicationById(applicationId);

      setSelectedApplication(data?.application || null);
    } catch (err) {
      console.error("Application details error:", err);

      setDetailsError(
        err.message || "Unable to load application details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeApplicationDetails = () => {
    setSelectedApplication(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading your applications...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <XCircle className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Unable to load applications
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-50">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-100 px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                CampusHire
              </h1>
              <p className="text-[11px] text-slate-400">Student Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            <Link
              to="/student/dashboard"
              onClick={closeMobileMenu}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
              Overview
            </Link>

            <Link
              to="/student/jobs"
              onClick={closeMobileMenu}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <BriefcaseBusiness className="h-[18px] w-[18px] shrink-0" />
              Browse Jobs
            </Link>

            <Link
              to="/student/applications"
              onClick={closeMobileMenu}
              className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
            >
              <FileText className="h-[18px] w-[18px] shrink-0" />
              My Applications
            </Link>

            <Link
              to="/student/profile"
              onClick={closeMobileMenu}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <UserRound className="h-[18px] w-[18px] shrink-0" />
              My Profile
            </Link>
          </div>

          <div className="mt-10">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Account
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              Sign out
            </button>
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {getInitials(currentUser?.name)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {currentUser?.name || "Student"}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {currentUser?.department || "Student"}
                {currentUser?.cgpa !== null &&
                currentUser?.cgpa !== undefined &&
                currentUser?.cgpa !== ""
                  ? ` · ${currentUser.cgpa} CGPA`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <main className="min-h-screen min-w-0 flex-1 lg:ml-[250px]">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="truncate font-bold text-slate-900">
                CampusHire
              </span>
            </div>

            <div className="relative hidden w-[310px] md:flex">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search jobs, companies..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {currentUser?.name || "Student"}
              </p>
              <p className="text-[11px] text-slate-500">Student</p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {getInitials(currentUser?.name)}
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1250px] px-4 py-6 sm:px-6 lg:px-8">
          {/* ===================================================
              HEADING
          =================================================== */}

          <div className="mb-7">
            <p className="mb-1 text-sm font-medium text-blue-600">
              Student Workspace
            </p>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  My Applications
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Track the progress of every job application you've submitted.
                </p>
              </div>

              <Link
                to="/student/jobs"
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                Browse Jobs
              </Link>
            </div>
          </div>

          {/* ===================================================
              SUMMARY CARDS
          =================================================== */}

          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Total Applications</p>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {totalApplications}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Applications submitted
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Under Review</p>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                  <Clock3 className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {underReviewCount}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Awaiting recruiter decision
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Shortlisted</p>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {shortlistedCount}
              </p>
              <p className="mt-1 text-xs text-slate-400">Moving forward</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Offers</p>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <Trophy className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {offerCount}
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                {offerCount > 0 ? "Congratulations!" : "No offers yet"}
              </p>
            </div>
          </div>

          {/* ===================================================
              FILTER BAR
          =================================================== */}

          <div className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {FILTERS.map((filter) => {
                  const active = activeFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      className={`rounded-lg px-3 py-2 text-xs transition ${
                        active
                          ? "bg-blue-600 font-semibold text-white"
                          : "font-medium text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                <p className="text-xs text-slate-400">
                  Showing {filteredApplications.length} of {applications.length} applications
                </p>

                {(searchTerm || activeFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("ALL");
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ===================================================
              APPLICATION CARDS
          =================================================== */}

          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => {
                const company =
                  application?.job?.company?.companyName || "Company";

                const status = application?.status || "APPLIED";
                const currentStageIndex = getCurrentStageIndex(status);
                const applicationId = application?._id;

                return (
                  <div
                    key={applicationId}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
                  >
                    <div className="p-4 sm:p-5 lg:p-6">
                      {/* APPLICATION HEADER */}
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-3 sm:gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold sm:h-12 sm:w-12 ${getCompanyLogoStyle(
                              company
                            )}`}
                          >
                            {getCompanyInitial(company)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h2 className="break-words text-base font-semibold text-slate-900">
                                {company}
                              </h2>
                              <span className="hidden text-slate-300 sm:inline">
                                •
                              </span>
                              <span className="break-all text-[11px] text-slate-500 sm:text-xs">
                                APP-{String(applicationId || "")
                                  .slice(-8)
                                  .toUpperCase()}
                              </span>
                            </div>

                            <p className="mt-1 break-words text-sm font-medium text-slate-700">
                              {application?.job?.title || "Position unavailable"}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                <MapPin className="h-3.5 w-3.5" />
                                {application?.job?.location ||
                                  "Location not specified"}
                              </span>

                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                Applied {formatDate(application?.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-end">
                          <span
                            className={`inline-flex min-w-0 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                              status
                            )}`}
                          >
                            {formatStatus(status)}
                          </span>

                          <button
                            type="button"
                            aria-label={`View options for ${company} application`}
                            onClick={() => openApplicationDetails(applicationId)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-slate-50"
                          >
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* PIPELINE */}
                      <div className="mt-7 border-t border-slate-100 pt-6">
                        <div className="hidden w-full md:block">
                          <div className="flex items-start">
                            {PIPELINE_STAGES.map((stage, index) => {
                              const state = getStageState(stage, status);
                              const isLast =
                                index === PIPELINE_STAGES.length - 1;

                              return (
                                <div
                                  key={stage}
                                  className="flex min-w-0 flex-1 items-start"
                                >
                                  <div className="flex min-w-[70px] flex-col items-center">
                                    <div
                                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                        state === "current"
                                          ? "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100"
                                          : state === "completed"
                                            ? "border-blue-100 bg-blue-100 text-blue-600"
                                            : "border-slate-200 bg-slate-50 text-slate-300"
                                      }`}
                                    >
                                      {getStageIcon(stage, state)}
                                    </div>

                                    <span
                                      className={`mt-2 whitespace-nowrap text-center text-[11px] ${
                                        state === "current"
                                          ? "font-bold text-slate-900"
                                          : state === "completed"
                                            ? "font-medium text-slate-500"
                                            : "font-medium text-slate-300"
                                      }`}
                                    >
                                      {formatStatus(stage)}
                                    </span>
                                  </div>

                                  {!isLast && (
                                    <div className="flex-1 px-2 pt-[18px]">
                                      <div
                                        className={`h-[2px] rounded-full ${
                                          index < currentStageIndex
                                            ? "bg-blue-200"
                                            : "bg-slate-200"
                                        }`}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="md:hidden">
                          <div className="space-y-0">
                            {PIPELINE_STAGES.map((stage, index) => {
                              const state = getStageState(stage, status);
                              const isLast =
                                index === PIPELINE_STAGES.length - 1;

                              return (
                                <div key={stage} className="flex items-stretch">
                                  <div className="flex w-9 shrink-0 flex-col items-center">
                                    <div
                                      className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border ${
                                        state === "current"
                                          ? "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100"
                                          : state === "completed"
                                            ? "border-blue-100 bg-blue-100 text-blue-600"
                                            : "border-slate-200 bg-slate-50 text-slate-300"
                                      }`}
                                    >
                                      {getStageIcon(stage, state)}
                                    </div>

                                    {!isLast && (
                                      <div
                                        className={`w-[2px] flex-1 ${
                                          index < currentStageIndex
                                            ? "bg-blue-200"
                                            : "bg-slate-200"
                                        }`}
                                      />
                                    )}
                                  </div>

                                  <div
                                    className={`min-w-0 flex-1 ${
                                      isLast ? "pb-0" : "pb-5"
                                    }`}
                                  >
                                    <div className="ml-3 min-h-8 pt-1">
                                      <p
                                        className={`text-sm ${
                                          state === "current"
                                            ? "font-bold text-slate-900"
                                            : state === "completed"
                                              ? "font-medium text-slate-600"
                                              : "font-medium text-slate-300"
                                        }`}
                                      >
                                        {formatStatus(stage)}
                                      </p>

                                      {state === "current" && (
                                        <p className="mt-0.5 text-[11px] text-blue-600">
                                          Current stage
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* REJECTED STATE */}
                      {status === "REJECTED" && (
                        <div className="mt-5 border-t border-red-100 pt-4">
                          <div className="flex items-center gap-2 text-red-600">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50">
                              <XCircle className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold">
                                Application Rejected
                              </p>
                              <p className="mt-0.5 text-[11px] text-red-500">
                                This application is no longer active.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* FOOTER */}
                      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-400">
                          Last updated {formatDate(application?.updatedAt)}
                        </p>

                        <button
                          type="button"
                          onClick={() => openApplicationDetails(applicationId)}
                          className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 sm:w-auto sm:justify-start"
                        >
                          View application details
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <FileText className="mx-auto h-9 w-9 text-slate-300" />

                <h3 className="mt-4 text-sm font-semibold text-slate-800">
                  {applications.length === 0
                    ? "No applications yet"
                    : "No matching applications"}
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  {applications.length === 0
                    ? "Once you apply for an active job, your application and its recruitment progress will appear here."
                    : "Try another status filter or clear your search to see more applications."}
                </p>

                {applications.length === 0 ? (
                  <Link
                    to="/student/jobs"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                    Browse Jobs
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("ALL");
                    }}
                    className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ===================================================
              INFORMATION NOTE
          =================================================== */}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs leading-5 text-blue-700">
                Application statuses are updated by company recruiters through
                the CampusHire recruitment workflow. Check this page regularly
                to follow your placement progress.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================
          APPLICATION DETAILS MODAL
      ========================================================= */}

      {(detailsLoading || detailsError || selectedApplication) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <button
            type="button"
            aria-label="Close application details"
            onClick={closeApplicationDetails}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Application Details
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {selectedApplication?.job?.title || "Application"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeApplicationDetails}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailsLoading && (
              <div className="p-10 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading application details...
                </p>
              </div>
            )}

            {!detailsLoading && detailsError && (
              <div className="p-8 text-center">
                <XCircle className="mx-auto h-8 w-8 text-red-500" />
                <p className="mt-3 text-sm font-medium text-red-700">
                  {detailsError}
                </p>
                <button
                  type="button"
                  onClick={closeApplicationDetails}
                  className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            )}

            {!detailsLoading && !detailsError && selectedApplication && (
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${getCompanyLogoStyle(
                      selectedApplication?.job?.company?.companyName
                    )}`}
                  >
                    {getCompanyInitial(
                      selectedApplication?.job?.company?.companyName
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedApplication?.job?.company?.companyName ||
                        "Company"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedApplication?.job?.title || "Position unavailable"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedApplication?.job?.location || "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Applied {formatDate(selectedApplication?.createdAt)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                      selectedApplication.status
                    )}`}
                  >
                    {formatStatus(selectedApplication.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Employment Type
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedApplication?.job?.employmentType ===
                      "INTERNSHIP"
                        ? "Internship"
                        : selectedApplication?.job?.employmentType ===
                            "FULL_TIME"
                          ? "Full-time"
                          : "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Graduation Year
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedApplication?.job?.graduationYear || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Minimum CGPA
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedApplication?.job?.minimumCGPA ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Application Updated
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatDate(selectedApplication?.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Application Timeline
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Status changes recorded by CampusHire.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {Array.isArray(selectedApplication.statusHistory) &&
                    selectedApplication.statusHistory.length > 0 ? (
                      [...selectedApplication.statusHistory]
                        .reverse()
                        .map((history, index) => (
                          <div
                            key={`${history.changedAt || "history"}-${index}`}
                            className="flex items-start gap-3"
                          >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">
                                {formatStatus(history.status)}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {formatDate(history.changedAt)}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No status history is available yet.
                      </p>
                    )}
                  </div>
                </div>

                {selectedApplication?.job?.company?.website && (
                  <a
                    href={
                      selectedApplication.job.company.website.startsWith("http")
                        ? selectedApplication.job.company.website
                        : `https://${selectedApplication.job.company.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Visit company website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyApplications;
