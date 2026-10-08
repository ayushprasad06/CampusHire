import React, { useEffect, useMemo, useState } from "react";

import {
    LayoutDashboard,
    Building2,
    BriefcaseBusiness,
    Users,
    LogOut,
    ChevronDown,
    Search,
    Plus,
    MapPin,
    Clock3,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    ArrowUpRight,
    CalendarDays,
    GraduationCap,
    Menu,
    X,
    Play,
    LockKeyhole,
    AlertCircle,
    LoaderCircle
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

import {
    getMyCompany
} from "../../api/companies.js";

import {
    getMyJobs,
    activateJob,
    closeJob
} from "../../api/jobs.js";

import {
    getRecruiterApplications
} from "../../api/applications.js";


// ============================================================
// HELPERS
// ============================================================

const statusLabels = {
    PENDING_REVIEW: "Pending Review",
    APPROVED: "Approved",
    ACTIVE: "Active",
    REJECTED: "Rejected",
    CLOSED: "Closed"
};

const formatEmploymentType = (value) => {
    if (value === "INTERNSHIP") {
        return "Internship";
    }

    if (value === "FULL_TIME") {
        return "Full-time";
    }

    return value || "Not specified";
};

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const formatDeadline = (value) => {
    if (!value) {
        return "Deadline not set";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Deadline unavailable";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const formatRelativePostedDate = (value) => {
    if (!value) {
        return "Posted date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Posted date unavailable";
    }

    const now = Date.now();
    const diff = now - date.getTime();

    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;

    if (diff < minute) {
        return "Posted just now";
    }

    if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        return `Posted ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (diff < day) {
        const hours = Math.floor(diff / hour);
        return `Posted ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    const days = Math.floor(diff / day);

    if (days < 7) {
        return `Posted ${days} ${days === 1 ? "day" : "days"} ago`;
    }

    return `Posted ${formatDate(value)}`;
};

const getInitials = (name) => {
    if (!name) {
        return "R";
    }

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const getCompanyInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || "C";
};

const getStatusClasses = (status) => {
    switch (status) {
        case "ACTIVE":
            return "bg-blue-50 text-blue-700";

        case "APPROVED":
            return "bg-emerald-50 text-emerald-700";

        case "PENDING_REVIEW":
            return "bg-amber-50 text-amber-700";

        case "REJECTED":
            return "bg-red-50 text-red-700";

        case "CLOSED":
            return "bg-slate-100 text-slate-600";

        default:
            return "bg-slate-100 text-slate-600";
    }
};


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none ${getStatusClasses(
                status
            )}`}
        >
            {status === "ACTIVE" && (
                <CheckCircle2 className="h-3 w-3 shrink-0" />
            )}

            {status === "APPROVED" && (
                <CheckCircle2 className="h-3 w-3 shrink-0" />
            )}

            {status === "PENDING_REVIEW" && (
                <Clock3 className="h-3 w-3 shrink-0" />
            )}

            {status === "REJECTED" && (
                <XCircle className="h-3 w-3 shrink-0" />
            )}

            {status === "CLOSED" && (
                <LockKeyhole className="h-3 w-3 shrink-0" />
            )}

            {statusLabels[status] || status || "Unknown"}
        </span>
    );
}


// ============================================================
// SIDEBAR NAV ITEM
// ============================================================

function NavItem({
    icon: Icon,
    children,
    active = false,
    onClick
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {children}
        </button>
    );
}


// ============================================================
// SIDEBAR
// ============================================================

function SidebarContent({
    mobile = false,
    onClose,
    recruiterName,
    recruiterInitials,
    navigate,
    onLogout
}) {
    const go = (path) => {
        if (mobile && onClose) {
            onClose();
        }

        navigate(path);
    };

    return (
        <div className="flex h-full flex-col">

            {/* Logo */}
            <div
                className={`flex h-16 shrink-0 items-center border-b border-slate-200 ${
                    mobile
                        ? "justify-between px-5"
                        : "px-6"
                }`}
            >
                <div className="flex min-w-0 items-center gap-2.5">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                        <BriefcaseBusiness className="h-5 w-5 text-white" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="truncate text-base font-semibold text-slate-900">
                            CampusHire
                        </h1>

                        <p className="text-[11px] text-slate-500">
                            Recruiter Portal
                        </p>
                    </div>
                </div>

                {mobile && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close navigation"
                        className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>


            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-5">

                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Workspace
                </p>

                <div className="space-y-1">

                    <NavItem
                        icon={LayoutDashboard}
                        onClick={() =>
                            go("/recruiter/dashboard")
                        }
                    >
                        Overview
                    </NavItem>

                    <NavItem
                        icon={Building2}
                        onClick={() =>
                            go("/recruiter/company")
                        }
                    >
                        Company Profile
                    </NavItem>

                    <NavItem
                        icon={BriefcaseBusiness}
                        active
                        onClick={() =>
                            go("/recruiter/jobs")
                        }
                    >
                        Job Postings
                    </NavItem>

                    <NavItem
                        icon={Users}
                        onClick={() =>
                            go("/recruiter/applicants")
                        }
                    >
                        Applicants
                    </NavItem>

                </div>


                <div className="mt-8">

                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Account
                    </p>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                    >
                        <LogOut className="h-[18px] w-[18px] shrink-0" />
                        Sign out
                    </button>

                </div>

            </nav>


            {/* Recruiter */}
            <div className="shrink-0 border-t border-slate-200 p-3">

                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                        {recruiterInitials}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                            {recruiterName}
                        </p>

                        <p className="text-xs text-slate-500">
                            Campus Hiring
                        </p>
                    </div>

                </div>

            </div>

        </div>
    );
}


// ============================================================
// JOB CARD
// ============================================================

function JobCard({
    job,
    companyName,
    stats,
    onViewJob,
    onViewApplicants,
    onActivate,
    onClose
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const status = job?.status || "PENDING_REVIEW";

    const isActive = status === "ACTIVE";
    const isApproved = status === "APPROVED";
    const isPending = status === "PENDING_REVIEW";
    const isRejected = status === "REJECTED";
    const isClosed = status === "CLOSED";

    const departments = Array.isArray(
        job?.allowedDepartments
    )
        ? job.allowedDepartments
        : [];

    const skills = Array.isArray(job?.skills)
        ? job.skills
        : [];

    const companyInitial =
        getCompanyInitial(companyName);

    return (
        <article className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="p-4 sm:p-5 lg:p-6">

                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start">

                    {/* Company logo */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg font-bold text-orange-600 sm:h-12 sm:w-12 sm:text-xl">
                        {companyInitial}
                    </div>


                    {/* Job information */}
                    <div className="min-w-0 flex-1">

                        <div className="flex min-w-0 flex-wrap items-center gap-2">

                            <h2 className="min-w-0 break-words text-[15px] font-semibold leading-6 text-slate-900 sm:text-base">
                                {job?.title || "Untitled Job"}
                            </h2>

                            <StatusBadge status={status} />

                            {isApproved && (
                                <span className="inline-flex shrink-0 items-center rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold leading-none text-blue-700">
                                    Ready to activate
                                </span>
                            )}

                        </div>


                        {/* Basic info */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">

                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                {companyName}
                            </span>

                            {job?.location && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    {job.location}
                                </span>
                            )}

                            {job?.employmentType && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                    {formatEmploymentType(
                                        job.employmentType
                                    )}
                                </span>
                            )}

                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                <Clock3 className="h-3.5 w-3.5 shrink-0" />
                                {formatRelativePostedDate(
                                    job?.createdAt
                                )}
                            </span>

                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                Apply by {formatDeadline(
                                    job?.applicationDeadline
                                )}
                            </span>

                        </div>


                        {/* Eligibility */}
                        <div className="mt-4 flex flex-wrap gap-2">

                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600">
                                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                Min CGPA:
                                <strong className="font-semibold text-slate-700">
                                    {job?.minimumCGPA !== null &&
                                    job?.minimumCGPA !==
                                        undefined
                                        ? Number(
                                              job.minimumCGPA
                                          ).toFixed(2)
                                        : "—"}
                                </strong>
                            </span>

                            {departments.length > 0
                                ? departments.map(
                                      (department) => (
                                          <span
                                              key={
                                                  department
                                              }
                                              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600"
                                          >
                                              {department}
                                          </span>
                                      )
                                  )
                                : (
                                    <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-400">
                                        No departments listed
                                    </span>
                                )}

                            {job?.graduationYear && (
                                <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600">
                                    Graduation{" "}
                                    {job.graduationYear}
                                </span>
                            )}

                        </div>


                        {/* Skills */}
                        <div className="mt-4">

                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Required Skills
                            </p>

                            {skills.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-xs text-slate-400">
                                    No specific skills listed
                                </p>
                            )}

                        </div>


                        {/* Active/closed stats */}
                        {(isActive || isClosed) && (
                            <div className="mt-5 grid grid-cols-3 border-t border-slate-100 pt-4">

                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {stats.applicants}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        Applicants
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {stats.shortlisted}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        Shortlisted
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {stats.offers}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        Selected
                                    </p>
                                </div>

                            </div>
                        )}


                        {/* Pending note */}
                        {isPending && (
                            <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-3.5">

                                <p className="text-xs font-semibold text-amber-800">
                                    Waiting for Placement Cell approval
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                    This posting will become visible to students only after it is approved and activated.
                                </p>

                                <p className="mt-1.5 text-[11px] text-amber-600">
                                    Submitted {formatDate(job?.createdAt)}
                                </p>

                            </div>
                        )}


                        {/* Rejected note */}
                        {isRejected && (
                            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3.5">

                                <p className="text-xs font-semibold text-red-700">
                                    Posting rejected by Placement Cell
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-600">
                                    {job?.rejectionReason ||
                                        "No rejection reason was provided."}
                                </p>

                                <p className="mt-1.5 text-[11px] text-red-500">
                                    Reviewed{" "}
                                    {formatDate(
                                        job?.approvedAt
                                    )}
                                </p>

                            </div>
                        )}


                        {/* Approved note */}
                        {isApproved && (
                            <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-3.5">

                                <p className="text-xs font-semibold text-emerald-700">
                                    Posting approved by Placement Cell
                                </p>

                                <p className="mt-1 text-xs leading-5 text-emerald-600">
                                    Activate this posting when you are ready to make it visible to eligible students.
                                </p>

                            </div>
                        )}

                    </div>


                    {/* Actions */}
                    <div className="flex w-full shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 lg:w-[155px] lg:border-t-0 lg:pt-0">

                        {isActive && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onViewApplicants(
                                            job._id
                                        )
                                    }
                                    className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                    View Applicants
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onClose(job._id)
                                    }
                                    className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                                >
                                    <LockKeyhole className="h-3.5 w-3.5" />
                                    Close Job
                                </button>
                            </>
                        )}

                        {isApproved && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onActivate(job._id)
                                    }
                                    className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Play className="h-3.5 w-3.5" />
                                    Activate Job
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onViewJob(job._id)
                                    }
                                    className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    View Posting
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}

                        {(isPending ||
                            isRejected ||
                            isClosed) && (
                            <button
                                type="button"
                                onClick={() =>
                                    onViewJob(job._id)
                                }
                                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                                {isPending
                                    ? "View Posting"
                                    : isRejected
                                      ? "View Details"
                                      : "View Posting"}

                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                        )}


                        {/* More menu */}
                        <div className="relative">

                            <button
                                type="button"
                                aria-label="More options"
                                onClick={() =>
                                    setMenuOpen(
                                        (value) => !value
                                    )
                                }
                                className="flex h-10 w-full items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {menuOpen && (
                                <>

                                    <button
                                        type="button"
                                        aria-label="Close menu"
                                        onClick={() =>
                                            setMenuOpen(false)
                                        }
                                        className="fixed inset-0 z-10 cursor-default"
                                    />

                                    <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onViewJob(
                                                    job._id
                                                );
                                            }}
                                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                            View Details
                                        </button>

                                        {isApproved && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    onActivate(
                                                        job._id
                                                    );
                                                }}
                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-blue-700 hover:bg-blue-50"
                                            >
                                                <Play className="h-3.5 w-3.5" />
                                                Activate
                                            </button>
                                        )}

                                        {isActive && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        onViewApplicants(
                                                            job._id
                                                        );
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Users className="h-3.5 w-3.5" />
                                                    View Applicants
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        onClose(
                                                            job._id
                                                        );
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    <LockKeyhole className="h-3.5 w-3.5" />
                                                    Close Job
                                                </button>
                                            </>
                                        )}

                                    </div>
                                </>
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </article>
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function JobPostings() {
    const navigate = useNavigate();

    const currentUser = getCurrentUser();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [company, setCompany] =
        useState(null);

    const [jobs, setJobs] =
        useState([]);

    const [applications, setApplications] =
        useState([]);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [selectedFilter, setSelectedFilter] =
        useState("All Jobs");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [actionError, setActionError] =
        useState("");

    const [actionJobId, setActionJobId] =
        useState(null);


    // ========================================================
    // LOAD DATA
    // ========================================================

    const loadData = async ({
        initial = false
    } = {}) => {
        try {
            if (initial) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");
            setActionError("");

            const [
                companyResult,
                jobsResult,
                applicationsResult
            ] = await Promise.allSettled([
                getMyCompany(),
                getMyJobs(),
                getRecruiterApplications()
            ]);

            if (
                jobsResult.status === "fulfilled"
            ) {
                setJobs(
                    Array.isArray(
                        jobsResult.value?.jobs
                    )
                        ? jobsResult.value.jobs
                        : []
                );
            } else {
                throw jobsResult.reason;
            }

            if (
                companyResult.status === "fulfilled"
            ) {
                setCompany(
                    companyResult.value?.company ||
                        null
                );
            } else {
                // A recruiter can have no company yet.
                setCompany(null);
            }

            if (
                applicationsResult.status ===
                "fulfilled"
            ) {
                setApplications(
                    Array.isArray(
                        applicationsResult.value
                            ?.applications
                    )
                        ? applicationsResult.value
                              .applications
                        : []
                );
            } else {
                // Job management should still load
                // even if applicant stats fail.
                setApplications([]);
            }
        } catch (err) {
            console.error(
                "Job postings load error:",
                err
            );

            setError(
                err.message ||
                    "Unable to load your job postings."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        loadData({ initial: true });
    }, []);


    // ========================================================
    // JOB FILTERING
    // ========================================================

    const filteredJobs = useMemo(() => {
        const normalizedSearch =
            searchTerm.trim().toLowerCase();

        return jobs.filter((job) => {
            const title =
                job?.title?.toLowerCase() || "";

            const location =
                job?.location?.toLowerCase() || "";

            const companyName =
                job?.company?.companyName?.toLowerCase() ||
                company?.companyName?.toLowerCase() ||
                "";

            const matchesSearch =
                !normalizedSearch ||
                title.includes(normalizedSearch) ||
                location.includes(normalizedSearch) ||
                companyName.includes(
                    normalizedSearch
                );

            let matchesFilter = true;

            switch (selectedFilter) {
                case "Active":
                    matchesFilter =
                        job?.status === "ACTIVE";
                    break;

                case "Pending Review":
                    matchesFilter =
                        job?.status ===
                        "PENDING_REVIEW";
                    break;

                case "Rejected":
                    matchesFilter =
                        job?.status === "REJECTED";
                    break;

                case "Closed":
                    matchesFilter =
                        job?.status === "CLOSED";
                    break;

                default:
                    matchesFilter = true;
            }

            return (
                matchesSearch &&
                matchesFilter
            );
        });
    }, [
        jobs,
        company,
        searchTerm,
        selectedFilter
    ]);


    // ========================================================
    // COUNTS
    // ========================================================

    const totalJobs = jobs.length;

    const activeCount = jobs.filter(
        (job) => job.status === "ACTIVE"
    ).length;

    const pendingCount = jobs.filter(
        (job) =>
            job.status === "PENDING_REVIEW"
    ).length;

    const rejectedCount = jobs.filter(
        (job) => job.status === "REJECTED"
    ).length;


    // ========================================================
    // APPLICATION STATS BY JOB
    // ========================================================

    const jobStats = useMemo(() => {
        const stats = new Map();

        applications.forEach((application) => {
            const jobId =
                application?.job?._id;

            if (!jobId) {
                return;
            }

            const key = String(jobId);

            const current =
                stats.get(key) || {
                    applicants: 0,
                    shortlisted: 0,
                    offers: 0
                };

            current.applicants += 1;

            if (
                application?.status ===
                "SHORTLISTED"
            ) {
                current.shortlisted += 1;
            }

            if (
                application?.status ===
                "SELECTED"
            ) {
                current.offers += 1;
            }

            stats.set(key, current);
        });

        return stats;
    }, [applications]);


    // ========================================================
    // NAVIGATION
    // ========================================================

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    const handleViewJob = (id) => {
        if (!id) {
            return;
        }

        navigate(`/recruiter/jobs/${id}`);
    };

    const handleViewApplicants = (id) => {
        if (!id) {
            return;
        }

        navigate(
            `/recruiter/applicants?jobId=${id}`
        );
    };


    // ========================================================
    // JOB ACTIONS
    // ========================================================

    const handleActivate = async (id) => {
        if (!id) {
            return;
        }

        try {
            setActionJobId(id);
            setActionError("");

            await activateJob(id);

            await loadData();

        } catch (err) {
            console.error(
                "Activate job error:",
                err
            );

            setActionError(
                err.message ||
                    "Unable to activate this job."
            );
        } finally {
            setActionJobId(null);
        }
    };

    const handleClose = async (id) => {
        if (!id) {
            return;
        }

        const confirmed = window.confirm(
            "Close this job posting? Students will no longer be able to apply."
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionJobId(id);
            setActionError("");

            await closeJob(id);

            await loadData();

        } catch (err) {
            console.error(
                "Close job error:",
                err
            );

            setActionError(
                err.message ||
                    "Unable to close this job."
            );
        } finally {
            setActionJobId(null);
        }
    };


    const recruiterName =
        currentUser?.name?.trim() ||
        "Recruiter";

    const recruiterInitials =
        getInitials(recruiterName);

    const companyName =
        company?.companyName ||
        jobs.find(
            (job) =>
                job?.company?.companyName
        )?.company?.companyName ||
        "Your Company";


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

                <div className="text-center">

                    <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading your job postings...
                    </p>

                </div>

            </div>
        );
    }


    // ========================================================
    // MAIN UI
    // ========================================================

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">

            {/* DESKTOP SIDEBAR */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">

                <SidebarContent
                    recruiterName={recruiterName}
                    recruiterInitials={
                        recruiterInitials
                    }
                    navigate={navigate}
                    onLogout={handleLogout}
                />

            </aside>


            {/* MOBILE SIDEBAR */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">

                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={
                            closeMobileMenu
                        }
                        className="absolute inset-0 bg-slate-900/30"
                    />

                    <aside className="relative h-full w-[280px] max-w-[85vw] bg-white shadow-xl">

                        <SidebarContent
                            mobile
                            onClose={
                                closeMobileMenu
                            }
                            recruiterName={
                                recruiterName
                            }
                            recruiterInitials={
                                recruiterInitials
                            }
                            navigate={navigate}
                            onLogout={
                                handleLogout
                            }
                        />

                    </aside>

                </div>
            )}


            {/* MAIN */}
            <main className="min-h-screen min-w-0 lg:ml-64">

                {/* TOP BAR */}
                <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">

                    <div className="flex min-w-0 items-center gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(
                                    true
                                )
                            }
                            aria-label="Open navigation"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="hidden h-10 w-[310px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">

                            <Search className="h-4 w-4 shrink-0 text-slate-400" />

                            <input
                                type="text"
                                value={
                                    searchTerm
                                }
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Search job postings..."
                                className="ml-2 w-full min-w-0 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />

                        </div>

                        <div className="min-w-0 md:hidden">

                            <p className="truncate text-sm font-semibold text-slate-900">
                                Job Postings
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                                Recruitment Management
                            </p>

                        </div>

                    </div>


                    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-slate-800">
                                {recruiterName}
                            </p>

                            <p className="text-[11px] text-slate-500">
                                Recruiter
                            </p>

                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                            {recruiterInitials}
                        </div>

                        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />

                    </div>

                </header>


                {/* PAGE CONTENT */}
                <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                    {/* HEADING */}
                    <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">

                        <div className="min-w-0">

                            <p className="mb-1 text-sm font-medium text-blue-600">
                                Recruitment Management
                            </p>

                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Job Postings
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-500">
                                Create, review, and manage your campus recruitment opportunities.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/recruiter/jobs/create"
                                )
                            }
                            className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                        >
                            <Plus className="h-4 w-4" />
                            Create Job Posting
                        </button>

                    </div>


                    {/* GLOBAL ERROR */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4">

                            <div className="flex items-start gap-3">

                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                                <div className="min-w-0">

                                    <p className="text-sm font-semibold text-red-700">
                                        Unable to load job postings
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-red-600">
                                        {error}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            loadData()
                                        }
                                        className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50"
                                    >
                                        Try again
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}


                    {/* ACTION ERROR */}
                    {actionError && (
                        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4">

                            <div className="flex min-w-0 items-start gap-3">

                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                                <p className="text-sm text-red-700">
                                    {actionError}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setActionError(
                                        ""
                                    )
                                }
                                className="shrink-0 rounded-md p-1 text-red-500 hover:bg-red-100"
                                aria-label="Dismiss error"
                            >
                                <X className="h-4 w-4" />
                            </button>

                        </div>
                    )}


                    {/* COMPANY WARNING */}
                    {!company && (
                        <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 p-4">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-start gap-3">

                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                                    <div>

                                        <p className="text-sm font-semibold text-amber-800">
                                            No company profile found
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-amber-700">
                                            Create your company profile before submitting a job posting.
                                        </p>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/recruiter/company"
                                        )
                                    }
                                    className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200 hover:bg-amber-50"
                                >
                                    Company Profile
                                </button>

                            </div>

                        </div>
                    )}


                    {/* SUMMARY CARDS */}
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

                        <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

                            <p className="text-xs text-slate-500">
                                Total Jobs
                            </p>

                            <p className="text-2xl font-bold leading-none text-slate-900">
                                {totalJobs}
                            </p>

                        </div>


                        <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

                            <p className="text-xs text-slate-500">
                                Active
                            </p>

                            <p className="text-2xl font-bold leading-none text-emerald-600">
                                {activeCount}
                            </p>

                        </div>


                        <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

                            <p className="text-xs leading-4 text-slate-500">
                                Pending Review
                            </p>

                            <p className="text-2xl font-bold leading-none text-amber-600">
                                {pendingCount}
                            </p>

                        </div>


                        <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

                            <p className="text-xs text-slate-500">
                                Rejected
                            </p>

                            <p className="text-2xl font-bold leading-none text-red-600">
                                {rejectedCount}
                            </p>

                        </div>

                    </div>


                    {/* FILTERS */}
                    <div className="mb-5 w-full rounded-xl border border-slate-200 bg-white">

                        <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">

                            <div className="relative min-w-0 flex-1 md:hidden">

                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={
                                        searchTerm
                                    }
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Search job postings..."
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                                />

                            </div>

                            <div className="flex flex-wrap gap-2">

                                {[
                                    "All Jobs",
                                    "Active",
                                    "Pending Review",
                                    "Rejected",
                                    "Closed"
                                ].map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() =>
                                            setSelectedFilter(
                                                filter
                                            )
                                        }
                                        className={`min-h-10 rounded-lg px-4 py-2.5 text-xs font-medium transition ${
                                            selectedFilter ===
                                            filter
                                                ? "bg-blue-600 font-semibold text-white"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    loadData()
                                }
                                disabled={refreshing}
                                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <LoaderCircle
                                    className={`h-3.5 w-3.5 ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />
                                Refresh
                            </button>

                        </div>

                    </div>


                    {/* RESULT COUNT */}
                    <div className="mb-4 flex items-center justify-between gap-3">

                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Your Job Postings
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {
                                        filteredJobs.length
                                    }
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {totalJobs}
                                </span>{" "}
                                postings
                            </p>
                        </div>

                        <p className="hidden text-right text-xs text-slate-400 sm:block">
                            {companyName}
                        </p>

                    </div>


                    {/* JOB LIST */}
                    <div className="w-full space-y-4">

                        {filteredJobs.length > 0 ? (

                            filteredJobs.map((job) => {

                                const stats =
                                    jobStats.get(
                                        String(
                                            job._id
                                        )
                                    ) || {
                                        applicants: 0,
                                        shortlisted: 0,
                                        offers: 0
                                    };

                                return (
                                    <div
                                        key={job._id}
                                        className="relative"
                                    >

                                        {actionJobId ===
                                            job._id && (
                                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/55 backdrop-blur-[1px]">
                                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                                                    <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" />
                                                    Updating job...
                                                </div>
                                            </div>
                                        )}

                                        <JobCard
                                            job={job}
                                            companyName={
                                                job?.company
                                                    ?.companyName ||
                                                companyName
                                            }
                                            stats={stats}
                                            onViewJob={
                                                handleViewJob
                                            }
                                            onViewApplicants={
                                                handleViewApplicants
                                            }
                                            onActivate={
                                                handleActivate
                                            }
                                            onClose={
                                                handleClose
                                            }
                                        />

                                    </div>
                                );
                            })

                        ) : (

                            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

                                <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" />

                                <p className="mt-3 text-sm font-semibold text-slate-800">
                                    No job postings found
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {totalJobs === 0
                                        ? "You have not created any job postings yet."
                                        : "Try changing your search or status filter."}
                                </p>

                                {totalJobs === 0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/recruiter/jobs/create"
                                            )
                                        }
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Job Posting
                                    </button>
                                )}

                            </div>

                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}

export default JobPostings;
