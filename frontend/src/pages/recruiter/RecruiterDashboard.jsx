import { useEffect, useMemo, useState } from "react";

import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Users,
  LogOut,
  ChevronDown,
  Search,
  Plus,
  ArrowUpRight,
  Clock3,
  UserRoundCheck,
  Trophy,
  MapPin,
  MoreHorizontal,
  Menu,
  X,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, logoutUser } from "../../api/auth.js";
import { getMyCompany } from "../../api/companies.js";
import { getMyJobs } from "../../api/jobs.js";
import { getRecruiterApplications } from "../../api/applications.js";

// ============================================================
// HELPERS
// ============================================================

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

const isWithinLastSevenDays = (value) => {
  if (!value) return false;

  const date = new Date(value).getTime();

  if (Number.isNaN(date)) return false;

  const now = Date.now();
  const difference = now - date;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return difference >= 0 && difference <= sevenDays;
};

const getInitials = (name) => {
  if (!name) return "RC";

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getCompanyInitial = (companyName) => {
  return companyName?.trim()?.charAt(0)?.toUpperCase() || "C";
};

// ============================================================
// NAV ITEM
// ============================================================

function NavItem({ icon: Icon, children, active = false, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{children}</span>
    </Link>
  );
}

// ============================================================
// SIDEBAR
// ============================================================

function SidebarContent({ mobile = false, onClose, onLogout, recruiter, company }) {
  const recruiterName = recruiter?.name || "Recruiter";
  const companyName = company?.companyName || "Company";

  return (
    <div className="flex h-full flex-col">
      {/* ======================================================
          LOGO
      ======================================================= */}
      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-slate-100 ${
          mobile ? "justify-between px-5" : "px-6"
        }`}
      >
        <div className="flex min-w-0 items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </div>

          <div className="ml-3 min-w-0">
            <h1 className="text-lg font-bold text-slate-900">
              CampusHire
            </h1>

            <p className="text-[11px] text-slate-400">Recruiter Portal</p>
          </div>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ======================================================
          NAVIGATION
      ======================================================= */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          <NavItem
            icon={LayoutDashboard}
            active
            to="/recruiter/dashboard"
            onClick={onClose}
          >
            Overview
          </NavItem>

          <NavItem
            icon={Building2}
            to="/recruiter/company"
            onClick={onClose}
          >
            Company Profile
          </NavItem>

          <NavItem
            icon={BriefcaseBusiness}
            to="/recruiter/jobs"
            onClick={onClose}
          >
            Job Postings
          </NavItem>

          <NavItem
            icon={Users}
            to="/recruiter/applicants"
            onClick={onClose}
          >
            Applicants
          </NavItem>
        </div>

        <div className="mt-10">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Account
          </p>

          <button
            type="button"
            onClick={onLogout}

            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Sign out
          </button>
        </div>
      </nav>

      {/* ======================================================
          RECRUITER CARD
      ======================================================= */}
      <div className="shrink-0 border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
            {getInitials(recruiterName)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {recruiterName}
            </p>

            <p className="truncate text-[11px] text-slate-500">
              {companyName === "Company" ? "Campus Hiring" : companyName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  icon: Icon,
  iconWrapper,
  iconColor,
  bottom,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrapper}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-4 min-h-[18px]">{bottom}</div>
    </div>
  );
}

// ============================================================
// PENDING JOB
// ============================================================

function PendingJob({ job, onView }) {
  const companyName = job?.company?.companyName || "Company";

  return (
    <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 font-bold text-orange-600">
          {getCompanyInitial(companyName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-semibold text-slate-900">
              {job?.title || "Untitled Job"}
            </h3>

            <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700 sm:hidden">
              Pending Review
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {job?.location || "Location not specified"}
            </span>

            <span className="text-xs text-slate-400">
              Submitted {formatDate(job?.createdAt)}
            </span>
          </div>
        </div>

        <span className="hidden shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 sm:inline-flex">
          Pending Review
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onView(job?._id)}
          className="flex min-h-9 flex-1 items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 sm:flex-none"
        >
          View
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({
  icon: Icon,
  iconWrapper,
  iconColor,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[68px] w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconWrapper}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
          {description}
        </p>
      </div>

      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

// ============================================================
// ACTIVE JOB
// ============================================================

function ActiveJob({ job, stats, onViewApplicants, onViewJob }) {
  const companyName = job?.company?.companyName || "Company";

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg font-bold text-orange-600">
          {getCompanyInitial(companyName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 break-words text-sm font-semibold text-slate-900">
              {job?.title || "Untitled Job"}
            </h3>

            <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Active
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-xs text-slate-500">{companyName}</span>

            <span className="hidden text-slate-300 sm:inline">•</span>

            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {job?.location || "Location not specified"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 border-t border-slate-100 pt-4">
            <div className="min-w-0">
              <p className="text-base font-semibold text-slate-900">
                {stats.applicants}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">Applicants</p>
            </div>

            <div className="min-w-0 border-l border-slate-100 pl-4">
              <p className="text-base font-semibold text-slate-900">
                {stats.shortlisted}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Shortlisted
              </p>
            </div>

            <div className="min-w-0 border-l border-slate-100 pl-4">
              <p className="text-base font-semibold text-slate-900">
                {stats.offers}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">Offers</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onViewJob(job?._id)}
          aria-label={`More options for ${job?.title || "job"}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onViewApplicants(job?._id)}
        className="mt-4 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
      >
        View Applicants
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function RecruiterDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recruiter, setRecruiter] = useState(currentUser);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD REAL DASHBOARD DATA
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [companyResult, jobsResult, applicationsResult] =
          await Promise.allSettled([
            getMyCompany(),
            getMyJobs(),
            getRecruiterApplications(),
          ]);

        if (cancelled) return;

        if (companyResult.status === "fulfilled") {
          setCompany(companyResult.value?.company || null);
        }

        if (jobsResult.status === "fulfilled") {
          setJobs(
            Array.isArray(jobsResult.value?.jobs)
              ? jobsResult.value.jobs
              : [],
          );
        }

        if (applicationsResult.status === "fulfilled") {
          setApplications(
            Array.isArray(applicationsResult.value?.applications)
              ? applicationsResult.value.applications
              : [],
          );
        }

        const failures = [companyResult, jobsResult, applicationsResult].filter(
          (result) => result.status === "rejected",
        );

        // Company may legitimately not exist yet. Jobs/applications are
        // required for the dashboard, so only show a fatal error when
        // those two requests fail.
        const jobsFailed = jobsResult.status === "rejected";
        const applicationsFailed = applicationsResult.status === "rejected";

        if (jobsFailed || applicationsFailed) {
          const firstFailure = failures.find(
            (result) => result !== companyResult,
          );

          throw firstFailure?.reason || new Error("Unable to load dashboard data");
        }

        if (companyResult.status === "rejected") {
          setCompany(null);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Recruiter dashboard error:", err);
        setError(err.message || "Unable to load recruiter dashboard.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const activeJobs = useMemo(
    () => jobs.filter((job) => job?.status === "ACTIVE"),
    [jobs],
  );

  const pendingJobs = useMemo(
    () => jobs.filter((job) => job?.status === "PENDING_REVIEW"),
    [jobs],
  );

  const activeJobIds = useMemo(
    () => new Set(activeJobs.map((job) => String(job._id))),
    [activeJobs],
  );

  const applicationStats = useMemo(() => {
    const activeApplications = applications.filter((application) =>
      activeJobIds.has(String(application?.job?._id)),
    );

    const shortlisted = activeApplications.filter(
      (application) => application?.status === "SHORTLISTED",
    ).length;

    const offers = applications.filter(
      (application) => application?.status === "SELECTED",
    ).length;

    const newThisWeek = applications.filter((application) =>
      isWithinLastSevenDays(application?.createdAt),
    ).length;

    return {
      total: applications.length,
      newThisWeek,
      shortlisted,
      offers,
    };
  }, [applications, activeJobIds]);

  const jobApplicationStats = useMemo(() => {
    const map = new Map();

    applications.forEach((application) => {
      const jobId = application?.job?._id;

      if (!jobId) return;

      const key = String(jobId);
      const current = map.get(key) || {
        applicants: 0,
        shortlisted: 0,
        offers: 0,
      };

      current.applicants += 1;

      if (application?.status === "SHORTLISTED") {
        current.shortlisted += 1;
      }

      if (application?.status === "SELECTED") {
        current.offers += 1;
      }

      map.set(key, current);
    });

    return map;
  }, [applications]);

  const visibleActiveJobs = activeJobs.slice(0, 3);
  const visiblePendingJobs = pendingJobs.slice(0, 4);

  const searchResults = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) return [];

    const jobResults = jobs
      .filter((job) => {
        const title = job?.title || "";
        const companyName = job?.company?.companyName || "";

        return (
          title.toLowerCase().includes(normalized) ||
          companyName.toLowerCase().includes(normalized)
        );
      })
      .slice(0, 4)
      .map((job) => ({
        type: "job",
        id: job._id,
        title: job.title,
        subtitle: job?.company?.companyName || "Job posting",
      }));

    const candidateResults = applications
      .filter((application) => {
        const name = application?.student?.name || "";
        const email = application?.student?.email || "";

        return (
          name.toLowerCase().includes(normalized) ||
          email.toLowerCase().includes(normalized)
        );
      })
      .slice(0, 4)
      .map((application) => ({
        type: "candidate",
        id: application._id,
        title: application?.student?.name || "Candidate",
        subtitle: application?.job?.title || "Applicant",
      }));

    return [...jobResults, ...candidateResults].slice(0, 6);
  }, [searchTerm, jobs, applications]);

  const recruiterName =
    recruiter?.name?.trim() || currentUser?.name?.trim() || "Recruiter";

  const companyName =
    company?.companyName ||
    jobs.find((job) => job?.company?.companyName)?.company?.companyName ||
    "Your Company";

  const recruiterInitials = getInitials(recruiterName);

  // Keep local recruiter state aligned with current localStorage.
  useEffect(() => {
    const updatedUser = getCurrentUser();

    if (updatedUser) {
      setRecruiter(updatedUser);
    }
  }, []);

  // ==========================================================
  // NAVIGATION / ACTION HANDLERS
  // ==========================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleGlobalSearchSubmit = (event) => {
    event.preventDefault();

    const trimmed = searchTerm.trim();

    if (!trimmed) return;

    const firstResult = searchResults[0];

    if (!firstResult) {
      navigate("/recruiter/jobs");
      return;
    }

    if (firstResult.type === "job") {
      navigate(`/recruiter/jobs/${firstResult.id}`);
    } else {
      navigate(`/recruiter/applicants/${firstResult.id}`);
    }

    setSearchTerm("");
  };

  const handleSearchResult = (result) => {
    if (result.type === "job") {
      navigate(`/recruiter/jobs/${result.id}`);
    } else {
      navigate(`/recruiter/applicants/${result.id}`);
    }

    setSearchTerm("");
  };

  const handleViewJob = (id) => {
    if (!id) return;
    navigate(`/recruiter/jobs/${id}`);
  };

  const handleViewApplicants = (jobId) => {
    if (!jobId) return;
    navigate(`/recruiter/applicants?jobId=${jobId}`);
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading recruiter dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

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

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      {/* ======================================================
          DESKTOP SIDEBAR
      ======================================================= */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent
          recruiter={recruiter}
          company={company}
          onClose={closeMobileMenu}
          onLogout={handleLogout}
        />
      </aside>

      {/* ======================================================
          MOBILE SIDEBAR
      ======================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-slate-900/30"
          />

          <aside className="relative h-full w-[280px] max-w-[85vw] bg-white shadow-xl">
            <SidebarContent
              mobile
              recruiter={recruiter}
              company={company}
              onClose={closeMobileMenu}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* ======================================================
          MAIN
      ======================================================= */}
      <main className="min-h-screen min-w-0 lg:ml-[250px]">
        {/* ====================================================
            TOP BAR
        ===================================================== */}
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          {/* Left */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative min-w-0">
              <form onSubmit={handleGlobalSearchSubmit}>
                <div className="hidden h-10 w-[310px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search candidates, jobs..."
                    className="ml-2 w-full min-w-0 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </form>

              {searchTerm.trim() && searchResults.length > 0 && (
                <div className="absolute left-0 top-12 z-50 hidden w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg md:block">
                  {searchResults.map((result) => (
                    <button
                      type="button"
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResult(result)}
                      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        {result.type === "job" ? (
                          <BriefcaseBusiness className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {result.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {result.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recruiter */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {companyName}
              </p>

              <p className="text-[11px] text-slate-500">Recruiter</p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
              {recruiterInitials}
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </div>
        </header>

        {/* ====================================================
            PAGE CONTENT
        ===================================================== */}
        <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          {/* PAGE HEADING */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mb-1 text-sm font-medium text-blue-600">
                Recruiter Workspace
              </p>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Recruiter Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-500">
                Manage your campus hiring pipeline and discover qualified candidates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/recruiter/jobs/create")}
              className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Job Posting
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Active Jobs"
              value={activeJobs.length}
              icon={BriefcaseBusiness}
              iconWrapper="bg-blue-50"
              iconColor="text-blue-600"
              bottom={
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span className="text-slate-500">
                    {pendingJobs.length} pending review
                  </span>
                </div>
              }
            />

            <StatCard
              label="Total Applicants"
              value={applicationStats.total}
              icon={Users}
              iconWrapper="bg-violet-50"
              iconColor="text-violet-600"
              bottom={
                <div className="flex items-center gap-1.5 text-xs">
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="font-medium text-emerald-600">
                    {applicationStats.newThisWeek}
                  </span>
                  <span className="text-slate-500">this week</span>
                </div>
              }
            />

            <StatCard
              label="Shortlisted"
              value={applicationStats.shortlisted}
              icon={UserRoundCheck}
              iconWrapper="bg-emerald-50"
              iconColor="text-emerald-600"
              bottom={
                <p className="text-xs text-slate-500">
                  Across all active jobs
                </p>
              }
            />

            <StatCard
              label="Offers"
              value={applicationStats.offers}
              icon={Trophy}
              iconWrapper="bg-amber-50"
              iconColor="text-amber-600"
              bottom={
                <p className="text-xs text-slate-500">
                  Selected candidates across your jobs
                </p>
              }
            />
          </div>

          {/* MAIN GRID */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* PENDING APPROVAL */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white xl:col-span-2">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-900">
                    Jobs Awaiting Approval
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Job postings submitted to the Placement Cell.
                  </p>
                </div>

                <span className="inline-flex w-fit shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  {pendingJobs.length} Pending
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {visiblePendingJobs.length > 0 ? (
                  visiblePendingJobs.map((job) => (
                    <PendingJob
                      key={job._id}
                      job={job}
                      onView={handleViewJob}
                    />
                  ))
                ) : (
                  <div className="px-6 py-10 text-center">
                    <Clock3 className="mx-auto h-7 w-7 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No jobs awaiting approval
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Newly submitted jobs will appear here until the Placement Cell reviews them.
                    </p>
                  </div>
                )}
              </div>

              {pendingJobs.length > visiblePendingJobs.length && (
                <div className="border-t border-slate-100 px-4 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() => navigate("/recruiter/jobs")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View all pending jobs
                  </button>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Common recruiter tasks.
                </p>
              </div>

              <div className="space-y-2 p-4">
                <QuickAction
                  icon={Plus}
                  iconWrapper="bg-blue-50"
                  iconColor="text-blue-600"
                  title="Create Job Posting"
                  description="Publish a new campus opening"
                  onClick={() => navigate("/recruiter/jobs/create")}
                />

                <QuickAction
                  icon={BriefcaseBusiness}
                  iconWrapper="bg-violet-50"
                  iconColor="text-violet-600"
                  title="Manage Job Postings"
                  description="View and manage your openings"
                  onClick={() => navigate("/recruiter/jobs")}
                />

                <QuickAction
                  icon={Users}
                  iconWrapper="bg-emerald-50"
                  iconColor="text-emerald-600"
                  title="View Applicants"
                  description="Review your candidate pipeline"
                  onClick={() => navigate("/recruiter/applicants")}
                />
              </div>
            </div>
          </div>

          {/* ACTIVE JOB POSTINGS */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900">
                  Active Job Postings
                </h2>

                <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                  Approved openings currently visible in your hiring workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/recruiter/jobs")}
                className="shrink-0 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {visibleActiveJobs.length > 0 ? (
                visibleActiveJobs.map((job) => (
                  <ActiveJob
                    key={job._id}
                    job={job}
                    stats={
                      jobApplicationStats.get(String(job._id)) || {
                        applicants: 0,
                        shortlisted: 0,
                        offers: 0,
                      }
                    }
                    onViewApplicants={handleViewApplicants}
                    onViewJob={handleViewJob}
                  />
                ))
              ) : (
                <div className="px-6 py-10 text-center">
                  <BriefcaseBusiness className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No active job postings
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Create a job posting and activate it after Placement Cell approval.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/recruiter/jobs/create")}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Job Posting
                  </button>
                </div>
              )}
            </div>

            {activeJobs.length > visibleActiveJobs.length && (
              <div className="border-t border-slate-100 px-4 py-3 sm:px-6">
                <button
                  type="button"
                  onClick={() => navigate("/recruiter/jobs")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View {activeJobs.length - visibleActiveJobs.length} more active job
                  {activeJobs.length - visibleActiveJobs.length === 1 ? "" : "s"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RecruiterDashboard;
