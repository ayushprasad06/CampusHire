import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    LayoutDashboard,
    Building2,
    BriefcaseBusiness,
    Users,
    LogOut,
    ChevronDown,
    ArrowLeft,
    MapPin,
    CalendarDays,
    GraduationCap,
    UsersRound,
    CheckCircle2,
    UserRoundCheck,
    Trophy,
    FileText,
    Edit3,
    MoreHorizontal,
    ExternalLink,
    Menu,
    X,
    AlertCircle,
    Loader2,
    RefreshCw,
    Clock3,
    XCircle,
    PlayCircle,
    StopCircle,
    Code2
} from "lucide-react";

import apiRequest from "../../api/api.js";
import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

function JobDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");

    const [user, setUser] = useState(
        getCurrentUser()
    );

    // ========================================================
    // FETCH JOB
    // ========================================================

    const fetchJob = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await apiRequest(
                `/jobs/${id}`,
                {
                    method: "GET"
                }
            );

            setJob(data.job);

        } catch (err) {

            console.error(
                "Fetch job error:",
                err
            );

            setError(
                err.message ||
                "Unable to load job details."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (!id) {

            setError(
                "Invalid job ID."
            );

            setLoading(false);

            return;
        }

        fetchJob();

    }, [id]);

    // ========================================================
    // USER / DISPLAY HELPERS
    // ========================================================

    const recruiterName =
        job?.createdBy?.name ||
        user?.name ||
        "Recruiter";

    const company =
        job?.company;

    const companyName =
        typeof company === "object"
            ? company?.companyName
            : "Company";

    const recruiterInitials = useMemo(() => {

        const name =
            recruiterName || "Recruiter";

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0).toUpperCase()
            )
            .join("");

    }, [recruiterName]);

    // ========================================================
    // FORMAT HELPERS
    // ========================================================

    const formatEmploymentType = (
        employmentType
    ) => {

        if (!employmentType) {
            return "Not specified";
        }

        if (employmentType === "FULL_TIME") {
            return "Full-time";
        }

        if (employmentType === "INTERNSHIP") {
            return "Internship";
        }

        return employmentType
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    const formatDeadline = (date) => {

        if (!date) {
            return "Deadline not set";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Deadline unavailable";
        }

        return parsedDate.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    };

    const formatDate = (date) => {

        if (!date) {
            return null;
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return null;
        }

        return parsedDate.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    };

    const formatStatus = (status) => {

        switch (status) {

            case "PENDING_REVIEW":
                return "Pending Review";

            case "APPROVED":
                return "Approved";

            case "ACTIVE":
                return "Active";

            case "CLOSED":
                return "Closed";

            case "REJECTED":
                return "Rejected";

            default:
                return status || "Unknown";
        }
    };

    const getStatusClasses = (status) => {

        switch (status) {

            case "PENDING_REVIEW":
                return "border-amber-100 bg-amber-50 text-amber-700";

            case "APPROVED":
                return "border-blue-100 bg-blue-50 text-blue-700";

            case "ACTIVE":
                return "border-emerald-100 bg-emerald-50 text-emerald-700";

            case "CLOSED":
                return "border-slate-200 bg-slate-100 text-slate-600";

            case "REJECTED":
                return "border-red-100 bg-red-50 text-red-700";

            default:
                return "border-slate-200 bg-slate-100 text-slate-600";
        }
    };

    const getStatusIcon = (status) => {

        switch (status) {

            case "PENDING_REVIEW":
                return (
                    <Clock3 className="h-3.5 w-3.5" />
                );

            case "APPROVED":
                return (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                );

            case "ACTIVE":
                return (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                );

            case "CLOSED":
                return (
                    <StopCircle className="h-3.5 w-3.5" />
                );

            case "REJECTED":
                return (
                    <XCircle className="h-3.5 w-3.5" />
                );

            default:
                return null;
        }
    };

    // ========================================================
    // NAVIGATION
    // ========================================================

    const goToJobPostings = () => {

        setMobileMenuOpen(false);

        navigate(
            "/recruiter/jobs"
        );
    };

    const goToDashboard = () => {

        setMobileMenuOpen(false);

        navigate(
            "/recruiter/dashboard"
        );
    };

    const goToCompany = () => {

        setMobileMenuOpen(false);

        navigate(
            "/recruiter/company"
        );
    };

    const goToApplicants = () => {

        setMobileMenuOpen(false);

        navigate(
            `/recruiter/applicants?jobId=${id}`
        );
    };

    const handleEdit = () => {

        navigate(
            `/recruiter/jobs/create?edit=${id}`
        );
    };

    const handleLogout = () => {

        logoutUser();

        navigate("/login");
    };

    // ========================================================
    // JOB ACTIONS
    // ========================================================

    const handleActivate = async () => {

        if (!job) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to activate this job posting?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(true);
            setError("");

            const data =
                await apiRequest(
                    `/jobs/${job._id}/activate`,
                    {
                        method: "PATCH"
                    }
                );

            setJob(
                data.job || job
            );

            if (data.job) {
                setJob(data.job);
            } else {
                await fetchJob();
            }

        } catch (err) {

            console.error(
                "Activate job error:",
                err
            );

            setError(
                err.message ||
                "Unable to activate the job."
            );

        } finally {

            setActionLoading(false);
        }
    };

    const handleClose = async () => {

        if (!job) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to close this job posting?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(true);
            setError("");

            const data =
                await apiRequest(
                    `/jobs/${job._id}/close`,
                    {
                        method: "PATCH"
                    }
                );

            setJob(
                data.job || job
            );

            if (!data.job) {
                await fetchJob();
            }

        } catch (err) {

            console.error(
                "Close job error:",
                err
            );

            setError(
                err.message ||
                "Unable to close the job."
            );

        } finally {

            setActionLoading(false);
        }
    };

    // ========================================================
    // LOADING STATE
    // ========================================================

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

                <div className="flex flex-col items-center gap-3">

                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

                    <p className="text-sm font-medium text-slate-600">
                        Loading job details...
                    </p>

                </div>

            </div>
        );
    }

    // ========================================================
    // ERROR STATE
    // ========================================================

    if (error && !job) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">

                        <AlertCircle className="h-6 w-6 text-red-600" />

                    </div>

                    <h1 className="mt-4 text-lg font-semibold text-slate-900">
                        Unable to load job
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
                    </p>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">

                        <button
                            type="button"
                            onClick={fetchJob}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>

                        <button
                            type="button"
                            onClick={goToJobPostings}
                            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Back to Job Postings
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    if (!job) {
        return null;
    }

    // ========================================================
    // JOB DATA
    // ========================================================

    const skills =
        Array.isArray(job.skills)
            ? job.skills
            : [];

    const departments =
        Array.isArray(
            job.allowedDepartments
        )
            ? job.allowedDepartments
            : [];

    const status =
        job.status || "PENDING_REVIEW";

    const createdDate =
        formatDate(job.createdAt);

    const approvedDate =
        formatDate(job.approvedAt);

    const companyLocation =
        typeof company === "object"
            ? company?.location
            : null;

    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="min-h-screen overflow-x-hidden bg-slate-50">

            {/* =========================================================
                DESKTOP SIDEBAR
            ========================================================== */}

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">

                {/* Logo */}

                <div className="flex h-16 items-center border-b border-slate-200 px-6">

                    <div className="flex items-center gap-2.5">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">

                            <BriefcaseBusiness className="h-5 w-5 text-white" />

                        </div>

                        <div>

                            <h1 className="text-base font-semibold text-slate-900">
                                CampusHire
                            </h1>

                            <p className="text-[11px] text-slate-500">
                                Recruiter Portal
                            </p>

                        </div>

                    </div>

                </div>

                {/* Navigation */}

                <nav className="flex-1 px-3 py-5">

                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Workspace
                    </p>

                    <div className="space-y-1">

                        <button
                            type="button"
                            onClick={goToDashboard}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </button>

                        <button
                            type="button"
                            onClick={goToCompany}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            <Building2 className="h-4 w-4" />
                            Company Profile
                        </button>

                        <button
                            type="button"
                            onClick={goToJobPostings}
                            className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
                        >
                            <BriefcaseBusiness className="h-4 w-4" />
                            Job Postings
                        </button>

                        <button
                            type="button"
                            onClick={goToApplicants}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            <Users className="h-4 w-4" />
                            Applicants
                        </button>

                    </div>

                    <div className="mt-8">

                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Account
                        </p>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>

                    </div>

                </nav>

                {/* Recruiter */}

                <div className="border-t border-slate-200 p-3">

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

            </aside>

            {/* =========================================================
                MOBILE SIDEBAR
            ========================================================== */}

            {mobileMenuOpen && (

                <div className="fixed inset-0 z-50 lg:hidden">

                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() =>
                            setMobileMenuOpen(false)
                        }
                        className="absolute inset-0 bg-slate-900/30"
                    />

                    <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl">

                        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">

                            <div className="flex items-center gap-2.5">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">

                                    <BriefcaseBusiness className="h-5 w-5 text-white" />

                                </div>

                                <div>

                                    <p className="text-base font-semibold text-slate-900">
                                        CampusHire
                                    </p>

                                    <p className="text-[11px] text-slate-500">
                                        Recruiter Portal
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(false)
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        <nav className="flex-1 px-3 py-5">

                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Workspace
                            </p>

                            <div className="space-y-1">

                                <button
                                    type="button"
                                    onClick={goToDashboard}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Overview
                                </button>

                                <button
                                    type="button"
                                    onClick={goToCompany}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    <Building2 className="h-4 w-4" />
                                    Company Profile
                                </button>

                                <button
                                    type="button"
                                    onClick={goToJobPostings}
                                    className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-3 text-sm font-medium text-blue-700"
                                >
                                    <BriefcaseBusiness className="h-4 w-4" />
                                    Job Postings
                                </button>

                                <button
                                    type="button"
                                    onClick={goToApplicants}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    <Users className="h-4 w-4" />
                                    Applicants
                                </button>

                            </div>

                            <div className="mt-8">

                                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Account
                                </p>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>

                            </div>

                        </nav>

                        <div className="border-t border-slate-200 p-3">

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

                    </aside>

                </div>
            )}

            {/* =========================================================
                MAIN
            ========================================================== */}

            <main className="min-h-screen min-w-0 lg:ml-64">

                {/* =====================================================
                    TOP BAR
                ====================================================== */}

                <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">

                    <div className="flex min-w-0 items-center gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(true)
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={goToJobPostings}
                            className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                        >

                            <ArrowLeft className="h-4 w-4" />

                            <span className="hidden sm:inline">
                                Back to Job Postings
                            </span>

                            <span className="sm:hidden">
                                Back
                            </span>

                        </button>

                        <div className="hidden h-5 w-px bg-slate-200 sm:block" />

                        <div className="hidden min-w-0 sm:block">

                            <p className="truncate text-sm font-semibold text-slate-800">
                                Job Details
                            </p>

                            <p className="text-[11px] text-slate-400">
                                Recruitment Management
                            </p>

                        </div>

                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-slate-800">
                                {companyName}
                            </p>

                            <p className="text-[11px] text-slate-500">
                                Recruiter
                            </p>

                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                            {recruiterInitials}
                        </div>

                        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />

                    </div>

                </header>

                {/* =====================================================
                    CONTENT
                ====================================================== */}

                <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                    {/* Error Banner */}

                    {error && job && (

                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">

                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <div className="min-w-0">

                                <p className="text-sm font-semibold text-red-900">
                                    Action failed
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                    {error}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                                className="ml-auto rounded-md p-1 text-red-500 hover:bg-red-100"
                            >
                                <X className="h-4 w-4" />
                            </button>

                        </div>
                    )}

                    {/* =================================================
                        JOB HEADER
                    ================================================== */}

                    <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 sm:p-6">

                        <div className="flex flex-col gap-5">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                                {/* Logo */}

                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 sm:h-16 sm:w-16">

                                    <span className="text-xl font-bold text-orange-600 sm:text-2xl">

                                        {companyName
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            "C"}

                                    </span>

                                </div>

                                {/* Details */}

                                <div className="min-w-0 flex-1">

                                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                                        <h1 className="break-words text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                                            {job.title}
                                        </h1>

                                        <span
                                            className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                                                status
                                            )}`}
                                        >
                                            {getStatusIcon(status)}
                                            {formatStatus(status)}
                                        </span>

                                    </div>

                                    <p className="mt-2 text-sm font-medium text-slate-600">
                                        {companyName}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">

                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">

                                            <MapPin className="h-3.5 w-3.5 shrink-0" />

                                            {job.location ||
                                                companyLocation ||
                                                "Location not specified"}

                                        </span>

                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">

                                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                                            {formatEmploymentType(
                                                job.employmentType
                                            )}

                                        </span>

                                        {createdDate && (

                                            <span className="flex items-center gap-1.5 text-xs text-slate-500">

                                                <Clock3 className="h-3.5 w-3.5 shrink-0" />

                                                Posted {createdDate}

                                            </span>
                                        )}

                                    </div>

                                </div>

                                {/* Actions */}

                                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-start">

                                    {status !== "CLOSED" &&
                                        status !== "REJECTED" && (

                                            <button
                                                type="button"
                                                onClick={handleEdit}
                                                disabled={
                                                    actionLoading
                                                }
                                                className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                                            >

                                                <Edit3 className="h-3.5 w-3.5" />

                                                Edit

                                            </button>
                                        )}

                                    <button
                                        type="button"
                                        aria-label="Refresh job"
                                        onClick={fetchJob}
                                        disabled={
                                            actionLoading
                                        }
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <RefreshCw
                                            className={`h-4 w-4 ${
                                                loading
                                                    ? "animate-spin"
                                                    : ""
                                            }`}
                                        />

                                    </button>

                                </div>

                            </div>

                            {/* Status / Approval */}

                            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-start gap-2.5">

                                    <div
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                            status ===
                                            "REJECTED"
                                                ? "bg-red-50"
                                                : status ===
                                                  "PENDING_REVIEW"
                                                ? "bg-amber-50"
                                                : "bg-emerald-50"
                                        }`}
                                    >

                                        {status ===
                                        "REJECTED" ? (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        ) : status ===
                                          "PENDING_REVIEW" ? (
                                            <Clock3 className="h-4 w-4 text-amber-600" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        )}

                                    </div>

                                    <div>

                                        <p className="text-xs font-semibold text-slate-800">

                                            {status ===
                                            "PENDING_REVIEW"
                                                ? "Awaiting Placement Cell approval"
                                                : status ===
                                                  "REJECTED"
                                                ? "Job posting rejected"
                                                : status ===
                                                  "CLOSED"
                                                ? "Job posting closed"
                                                : status ===
                                                  "APPROVED"
                                                ? "Approved by Placement Cell"
                                                : "Approved & active"}

                                        </p>

                                        <p className="mt-0.5 text-[11px] text-slate-400">

                                            {status ===
                                            "PENDING_REVIEW"
                                                ? "The job will become visible to eligible students after approval."
                                                : status ===
                                                  "REJECTED"
                                                ? job.rejectionReason ||
                                                  "Please review the rejection reason and edit the posting before resubmitting."
                                                : status ===
                                                  "CLOSED"
                                                ? "This posting is no longer accepting applications."
                                                : approvedDate
                                                ? `Approved ${approvedDate}`
                                                : "Placement Cell approval recorded."}

                                        </p>

                                    </div>

                                </div>

                                {status ===
                                    "ACTIVE" && (

                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">

                                        <CheckCircle2 className="h-3.5 w-3.5" />

                                        Visible to eligible students

                                    </span>
                                )}

                                {status ===
                                    "APPROVED" && (

                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">

                                        <CheckCircle2 className="h-3.5 w-3.5" />

                                        Ready to activate

                                    </span>
                                )}

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        ACTION BAR
                    ================================================== */}

                    {(status === "APPROVED" ||
                        status === "ACTIVE" ||
                        status === "REJECTED") && (

                        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <p className="text-sm font-semibold text-slate-900">
                                        Job Actions
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">

                                        {status ===
                                        "APPROVED"
                                            ? "Activate this approved posting to make it available to eligible students."
                                            : status ===
                                              "ACTIVE"
                                            ? "Close the posting when you no longer want to accept applications."
                                            : "Edit the rejected posting and resubmit it for Placement Cell review."}

                                    </p>

                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">

                                    {status ===
                                        "APPROVED" && (

                                        <button
                                            type="button"
                                            onClick={
                                                handleActivate
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >

                                            {actionLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <PlayCircle className="h-4 w-4" />
                                            )}

                                            Activate Job

                                        </button>
                                    )}

                                    {status ===
                                        "ACTIVE" && (

                                        <button
                                            type="button"
                                            onClick={
                                                handleClose
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >

                                            {actionLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <StopCircle className="h-4 w-4" />
                                            )}

                                            Close Job

                                        </button>
                                    )}

                                    {status ===
                                        "REJECTED" && (

                                        <button
                                            type="button"
                                            onClick={
                                                handleEdit
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >

                                            <Edit3 className="h-4 w-4" />

                                            Edit & Resubmit

                                        </button>
                                    )}

                                </div>

                            </div>

                        </section>
                    )}

                    {/* =================================================
                        TWO COLUMN CONTENT
                    ================================================== */}

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                        {/* =================================================
                            LEFT CONTENT
                        ================================================== */}

                        <div className="space-y-5 lg:col-span-2">

                            {/* About Role */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">

                                            <FileText className="h-4 w-4 text-blue-600" />

                                        </div>

                                        <div className="min-w-0">

                                            <h2 className="text-sm font-semibold text-slate-900">
                                                About the Role
                                            </h2>

                                            <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                                Job description and responsibilities.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="p-4 sm:p-6">

                                    <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                                        {job.description ||
                                            "No job description provided."}
                                    </p>

                                </div>

                            </section>

                            {/* Eligibility */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">

                                            <GraduationCap className="h-4 w-4 text-violet-600" />

                                        </div>

                                        <div className="min-w-0">

                                            <h2 className="text-sm font-semibold text-slate-900">
                                                Eligibility Criteria
                                            </h2>

                                            <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                                Requirements used by the eligibility engine.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="p-4 sm:p-6">

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">

                                        {/* CGPA */}

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                            <p className="text-xs text-slate-500">
                                                Minimum CGPA
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-slate-900">

                                                {typeof job.minimumCGPA ===
                                                "number"
                                                    ? job.minimumCGPA.toFixed(
                                                          2
                                                      )
                                                    : "—"}

                                            </p>

                                        </div>

                                        {/* Graduation */}

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                            <p className="text-xs text-slate-500">
                                                Graduation Year
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-slate-900">
                                                {job.graduationYear ||
                                                    "—"}
                                            </p>

                                        </div>

                                        {/* Application Deadline */}

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                            <p className="text-xs text-slate-500">
                                                Application Deadline
                                            </p>

                                            <p className="mt-1 flex items-center gap-1.5 text-xl font-bold text-slate-900">
                                                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                                                {formatDeadline(
                                                    job.applicationDeadline
                                                )}
                                            </p>

                                        </div>

                                        {/* Departments */}

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                            <p className="text-xs text-slate-500">
                                                Departments
                                            </p>

                                            <p className="mt-2 break-words text-sm font-semibold text-slate-900">

                                                {departments.length >
                                                0
                                                    ? departments.join(
                                                          " · "
                                                      )
                                                    : "All departments"}

                                            </p>

                                        </div>

                                    </div>

                                    <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">

                                        <div className="flex items-start gap-2.5">

                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                                            <p className="text-xs leading-5 text-blue-800">
                                                These criteria are evaluated on the server before a student can submit an application.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </section>

                            {/* Skills */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">

                                            <Code2 className="h-4 w-4 text-blue-600" />

                                        </div>

                                        <div>

                                            <h2 className="text-sm font-semibold text-slate-900">
                                                Required Skills
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Skills specified for this job posting.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="p-4 sm:p-6">

                                    {skills.length > 0 ? (

                                        <div className="flex flex-wrap gap-2">

                                            {skills.map(
                                                (
                                                    skill,
                                                    index
                                                ) => (

                                                    <span
                                                        key={`${skill}-${index}`}
                                                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
                                                    >
                                                        {skill}
                                                    </span>

                                                )
                                            )}

                                        </div>

                                    ) : (

                                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">

                                            <Code2 className="mx-auto h-5 w-5 text-slate-400" />

                                            <p className="mt-2 text-xs font-medium text-slate-500">
                                                No specific skills listed.
                                            </p>

                                        </div>
                                    )}

                                </div>

                            </section>

                        </div>

                        {/* =================================================
                            RIGHT CONTENT
                        ================================================== */}

                        <div className="space-y-5">

                            {/* Hiring Details */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                                <div className="border-b border-slate-100 px-5 py-5">

                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Job Details
                                    </h2>

                                </div>

                                <div className="space-y-4 p-5">

                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Employment
                                        </span>

                                        <span className="text-right text-sm font-semibold text-slate-800">
                                            {formatEmploymentType(
                                                job.employmentType
                                            )}
                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Location
                                        </span>

                                        <span className="text-right text-sm font-semibold text-slate-800">
                                            {job.location ||
                                                "Not specified"}
                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Minimum CGPA
                                        </span>

                                        <span className="text-sm font-semibold text-slate-800">
                                            {typeof job.minimumCGPA ===
                                            "number"
                                                ? job.minimumCGPA.toFixed(
                                                      2
                                                  )
                                                : "—"}
                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Graduation Year
                                        </span>

                                        <span className="text-sm font-semibold text-slate-800">
                                            {job.graduationYear ||
                                                "—"}
                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Posted
                                        </span>

                                        <span className="text-right text-sm font-semibold text-slate-800">
                                            {createdDate ||
                                                "—"}
                                        </span>

                                    </div>

                                </div>

                            </section>

                            {/* Company */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                                <div className="border-b border-slate-100 px-5 py-5">

                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Company
                                    </h2>

                                </div>

                                <div className="p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-bold text-orange-600">

                                            {companyName
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                                "C"}

                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {companyName}
                                            </p>

                                            {company?.industry && (

                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    {company.industry}
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                    {company?.website && (

                                        <a
                                            href={
                                                company.website.startsWith(
                                                    "http"
                                                )
                                                    ? company.website
                                                    : `https://${company.website}`
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                        >

                                            <ExternalLink className="h-3.5 w-3.5" />

                                            Visit Company Website

                                        </a>
                                    )}

                                </div>

                            </section>

                            {/* Posted By */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                                <div className="border-b border-slate-100 px-5 py-5">

                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Posted By
                                    </h2>

                                </div>

                                <div className="p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                                            {recruiterInitials}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {recruiterName}
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Campus Recruiter
                                            </p>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={goToCompany}
                                        className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >

                                        <Building2 className="h-3.5 w-3.5" />

                                        View Company Profile

                                    </button>

                                </div>

                            </section>

                            {/* Status Card */}

                            <section
                                className={`rounded-xl border p-4 sm:p-5 ${
                                    status ===
                                    "REJECTED"
                                        ? "border-red-100 bg-red-50"
                                        : status ===
                                          "PENDING_REVIEW"
                                        ? "border-amber-100 bg-amber-50"
                                        : status ===
                                          "CLOSED"
                                        ? "border-slate-200 bg-slate-100"
                                        : "border-emerald-100 bg-emerald-50"
                                }`}
                            >

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                                        {status ===
                                        "REJECTED" ? (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        ) : status ===
                                          "PENDING_REVIEW" ? (
                                            <Clock3 className="h-5 w-5 text-amber-600" />
                                        ) : status ===
                                          "CLOSED" ? (
                                            <StopCircle className="h-5 w-5 text-slate-600" />
                                        ) : (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        )}

                                    </div>

                                    <div className="min-w-0">

                                        <p
                                            className={`text-sm font-semibold ${
                                                status ===
                                                "REJECTED"
                                                    ? "text-red-900"
                                                    : status ===
                                                      "PENDING_REVIEW"
                                                    ? "text-amber-900"
                                                    : status ===
                                                      "CLOSED"
                                                    ? "text-slate-800"
                                                    : "text-emerald-900"
                                            }`}
                                        >
                                            {formatStatus(
                                                status
                                            )}
                                        </p>

                                        <p
                                            className={`mt-1 text-xs leading-5 ${
                                                status ===
                                                "REJECTED"
                                                    ? "text-red-700"
                                                    : status ===
                                                      "PENDING_REVIEW"
                                                    ? "text-amber-700"
                                                    : status ===
                                                      "CLOSED"
                                                    ? "text-slate-600"
                                                    : "text-emerald-700"
                                            }`}
                                        >

                                            {status ===
                                            "PENDING_REVIEW"
                                                ? "This job is waiting for Placement Cell approval and is not visible to students yet."
                                                : status ===
                                                  "APPROVED"
                                                ? "The Placement Cell has approved this posting. Activate it when you are ready to make it visible."
                                                : status ===
                                                  "ACTIVE"
                                                ? "This job posting is active and visible to students who satisfy the eligibility criteria."
                                                : status ===
                                                  "CLOSED"
                                                ? "This job posting has been closed and is no longer available for applications."
                                                : job.rejectionReason ||
                                                  "This job posting was rejected by the Placement Cell. Edit it and resubmit it for review."}

                                        </p>

                                    </div>

                                </div>

                            </section>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default JobDetails;