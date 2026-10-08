import React, { useEffect, useMemo, useState } from "react";

import {
    BriefcaseBusiness,
    LayoutDashboard,
    Building2,
    ClipboardList,
    FileClock,
    ShieldCheck,
    LogOut,
    ChevronDown,
    Clock3,
    CheckCircle2,
    XCircle,
    Users,
    ArrowRight,
    AlertCircle,
    Menu,
    X,
    RefreshCw
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

import {
    getAdminDashboard,
    approveCompany,
    rejectCompany,
    approveJob,
    rejectJob
} from "../../api/admin.js";


// ============================================================
// HELPERS
// ============================================================

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "2-digit",
            year: "numeric"
        }
    );
};


const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
};


const getInitials = (name) =>
    String(name || "Admin")
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "PC";


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    icon: Icon,
    label,
    value,
    description,
    iconBg,
    iconColor
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">

            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>

                </div>

                <div
                    className={`shrink-0 rounded-lg p-3 ${iconBg}`}
                >
                    <Icon
                        className={`h-5 w-5 ${iconColor}`}
                    />
                </div>

            </div>

        </div>
    );
}


// ============================================================
// NAV ITEM
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
                    : "text-slate-600 hover:bg-slate-50"
            }`}
        >

            <Icon className="h-4 w-4 shrink-0" />

            <span>
                {children}
            </span>

        </button>
    );
}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

function AdminDashboard() {

    const navigate = useNavigate();

    const user =
        getCurrentUser();

    const adminName =
        user?.name ||
        "Placement Admin";

    const initials =
        getInitials(
            adminName
        );


    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    const [
        dashboard,
        setDashboard
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        actionLoading,
        setActionLoading
    ] = useState("");


    // ========================================================
    // LOAD DASHBOARD
    // ========================================================

    const loadDashboard = async (
        isRefresh = false
    ) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data =
                await getAdminDashboard();

            setDashboard(data);

        } catch (err) {

            console.error(
                "Admin dashboard error:",
                err
            );

            setError(
                err.message ||
                "Unable to load the admin dashboard."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    useEffect(() => {

        loadDashboard();

    }, []);


    // ========================================================
    // NAVIGATION
    // ========================================================

    const navigateAndClose = (
        path
    ) => {

        setMobileMenuOpen(false);

        navigate(path);

    };


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout = () => {

        logoutUser();

        navigate("/login");

    };


    // ========================================================
    // COMPANY APPROVAL
    // ========================================================

    const handleApproveCompany = async (
        company
    ) => {

        try {

            setActionLoading(
                `company-approve-${company._id}`
            );

            setError("");

            await approveCompany(
                company._id
            );

            await loadDashboard(
                true
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to approve the company."
            );

        } finally {

            setActionLoading("");

        }

    };


    const handleRejectCompany = async (
        company
    ) => {

        const reason =
            window.prompt(
                "Enter a rejection reason:",
                "Company registration rejected"
            );

        if (
            reason === null
        ) {
            return;
        }

        if (
            !reason.trim()
        ) {

            setError(
                "A rejection reason is required."
            );

            return;
        }


        try {

            setActionLoading(
                `company-reject-${company._id}`
            );

            setError("");

            await rejectCompany(
                company._id,
                reason.trim()
            );

            await loadDashboard(
                true
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to reject the company."
            );

        } finally {

            setActionLoading("");

        }

    };


    // ========================================================
    // JOB APPROVAL
    // ========================================================

    const handleApproveJob = async (
        job
    ) => {

        try {

            setActionLoading(
                `job-approve-${job._id}`
            );

            setError("");

            await approveJob(
                job._id
            );

            await loadDashboard(
                true
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to approve the job posting."
            );

        } finally {

            setActionLoading("");

        }

    };


    const handleRejectJob = async (
        job
    ) => {

        const reason =
            window.prompt(
                "Enter a rejection reason:",
                "Job posting rejected"
            );

        if (
            reason === null
        ) {
            return;
        }

        if (
            !reason.trim()
        ) {

            setError(
                "A rejection reason is required."
            );

            return;
        }


        try {

            setActionLoading(
                `job-reject-${job._id}`
            );

            setError("");

            await rejectJob(
                job._id,
                reason.trim()
            );

            await loadDashboard(
                true
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to reject the job posting."
            );

        } finally {

            setActionLoading("");

        }

    };


    // ========================================================
    // DATA
    // ========================================================

    const stats =
        dashboard?.stats || {
            pendingCompanies: 0,
            pendingJobs: 0,
            approvedCompanies: 0,
            activeRecruiters: 0
        };


    const pendingCompanies =
        dashboard?.pendingCompanies || [];


    const pendingJobs =
        dashboard?.pendingJobs || [];


    const recentActivity =
        dashboard?.recentActivity || [];


    const totalPending =
        stats.pendingCompanies +
        stats.pendingJobs;


    const recentActivityEmpty =
        useMemo(
            () =>
                recentActivity.length === 0,
            [recentActivity]
        );


    // ========================================================
    // SIDEBAR
    // ========================================================

    const SidebarContent = ({
        mobile = false
    }) => (

        <div className="flex h-full flex-col">

            {/* Logo */}

            <div
                className={`flex h-16 shrink-0 items-center border-b border-slate-200 ${
                    mobile
                        ? "justify-between px-5"
                        : "px-6"
                }`}
            >

                <div className="flex items-center gap-2.5">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">

                        <BriefcaseBusiness className="h-5 w-5 text-white" />

                    </div>

                    <div>

                        <p className="text-base font-semibold text-slate-900">
                            CampusHire
                        </p>

                        <p className="text-[11px] text-slate-500">
                            Placement Cell
                        </p>

                    </div>

                </div>


                {mobile && (

                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenuOpen(false)
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Close navigation"
                    >

                        <X className="h-5 w-5" />

                    </button>

                )}

            </div>


            {/* Navigation */}

            <nav className="flex-1 overflow-y-auto px-3 py-5">

                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Administration
                </p>


                <div className="space-y-1">

                    <NavItem
                        icon={LayoutDashboard}
                        active
                        onClick={() =>
                            navigateAndClose(
                                "/admin/dashboard"
                            )
                        }
                    >
                        Overview
                    </NavItem>


                    <NavItem
                        icon={Building2}
                        onClick={() =>
                            navigateAndClose(
                                "/admin/companies"
                            )
                        }
                    >
                        Companies
                    </NavItem>


                    <NavItem
                        icon={ClipboardList}
                        onClick={() =>
                            navigateAndClose(
                                "/admin/jobs"
                            )
                        }
                    >
                        Job Postings
                    </NavItem>


                    <NavItem
                        icon={FileClock}
                        onClick={() =>
                            navigateAndClose(
                                "/admin/pending-reviews"
                            )
                        }
                    >
                        Pending Reviews
                    </NavItem>


                    <NavItem
                        icon={ShieldCheck}
                        onClick={() =>
                            navigateAndClose(
                                "/admin/audit-logs"
                            )
                        }
                    >
                        Audit Logs
                    </NavItem>

                </div>

            </nav>


            {/* Admin Account */}

            <div className="shrink-0 border-t border-slate-200 p-3">

                <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {initials}
                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-slate-900">
                            {adminName}
                        </p>

                        <p className="text-xs text-slate-500">
                            Placement Cell
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={
                        handleLogout
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                >

                    <LogOut className="h-4 w-4 shrink-0" />

                    Sign out

                </button>

            </div>

        </div>

    );


    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading &&
        !dashboard
    ) {

        return (

            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                    <p className="text-sm font-medium text-slate-700">
                        Loading administration dashboard...
                    </p>

                </div>

            </div>

        );

    }


    // ========================================================
    // PAGE
    // ========================================================

    return (

        <div className="min-h-screen overflow-x-hidden bg-slate-50">

            {/* Mobile Overlay */}

            {mobileMenuOpen && (

                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() =>
                        setMobileMenuOpen(false)
                    }
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                />

            )}


            {/* Sidebar */}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
                    mobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                } lg:translate-x-0`}
            >

                <SidebarContent />

            </aside>


            {/* Main */}

            <div className="min-w-0 lg:ml-64">

                {/* Header */}

                <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

                    <div className="flex min-w-0 items-center gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(
                                    true
                                )
                            }
                            className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                            aria-label="Open navigation"
                        >

                            <Menu className="h-5 w-5" />

                        </button>


                        <div className="min-w-0">

                            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                                Placement Cell
                            </h1>

                            <p className="hidden truncate text-xs text-slate-500 sm:block">
                                Manage companies, job approvals, and recruitment activity
                            </p>

                        </div>

                    </div>


                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">

                        <button
                            type="button"
                            onClick={() =>
                                loadDashboard(true)
                            }
                            disabled={
                                refreshing
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Refresh dashboard"
                            title="Refresh dashboard"
                        >

                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                        </button>


                        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">

                            <ShieldCheck className="h-4 w-4 text-blue-600" />

                            <span className="text-sm font-medium text-slate-700">
                                Admin
                            </span>

                        </div>


                        <div className="hidden h-6 w-px bg-slate-200 sm:block" />


                        <div className="flex items-center gap-2 sm:gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                {initials}
                            </div>

                            <div className="hidden sm:block">

                                <p className="text-sm font-medium text-slate-800">
                                    {adminName}
                                </p>

                                <p className="text-xs text-slate-500">
                                    Placement Cell
                                </p>

                            </div>

                            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />

                        </div>

                    </div>

                </header>


                {/* Main Content */}

                <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                    {/* Intro */}

                    <div className="mb-6">

                        <h2 className="text-xl font-semibold text-slate-900">
                            Administration Overview
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Review and approve recruitment activity before it becomes visible to students.
                        </p>

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <div>

                                <p className="text-sm font-semibold text-red-900">
                                    Action could not be completed
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* Important Notice */}

                    <div
                        className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
                            totalPending > 0
                                ? "border-amber-200 bg-amber-50"
                                : "border-emerald-200 bg-emerald-50"
                        }`}
                    >

                        {totalPending > 0 ? (

                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                        ) : (

                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                        )}


                        <div>

                            <p
                                className={`text-sm font-semibold ${
                                    totalPending > 0
                                        ? "text-amber-900"
                                        : "text-emerald-900"
                                }`}
                            >

                                {totalPending > 0
                                    ? "Action required"
                                    : "All reviews up to date"}

                            </p>


                            <p
                                className={`mt-1 text-xs leading-5 ${
                                    totalPending > 0
                                        ? "text-amber-800"
                                        : "text-emerald-800"
                                }`}
                            >

                                {totalPending > 0

                                    ? `${stats.pendingCompanies} pending ${
                                          stats.pendingCompanies === 1
                                              ? "company"
                                              : "companies"
                                      } and ${stats.pendingJobs} pending ${
                                          stats.pendingJobs === 1
                                              ? "job posting"
                                              : "job postings"
                                      } are waiting for review. Unapproved jobs remain hidden from students.`

                                    : "There are currently no pending company or job posting approvals. All submitted recruitment activity has been reviewed."}

                            </p>

                        </div>

                    </div>


                    {/* Stats */}

                    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <StatCard
                            icon={Clock3}
                            label="Pending Companies"
                            value={
                                stats.pendingCompanies
                            }
                            description="Awaiting verification"
                            iconBg="bg-amber-50"
                            iconColor="text-amber-600"
                        />


                        <StatCard
                            icon={ClipboardList}
                            label="Pending Job Posts"
                            value={
                                stats.pendingJobs
                            }
                            description="Awaiting approval"
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                        />


                        <StatCard
                            icon={CheckCircle2}
                            label="Approved Companies"
                            value={
                                stats.approvedCompanies
                            }
                            description="Approved on platform"
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                        />


                        <StatCard
                            icon={Users}
                            label="Active Recruiters"
                            value={
                                stats.activeRecruiters
                            }
                            description="Registered recruiters"
                            iconBg="bg-violet-50"
                            iconColor="text-violet-600"
                        />

                    </div>


                    {/* Pending Sections */}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                        {/* Pending Companies */}

                        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">

                            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        Pending Companies
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Newly registered companies requiring verification.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/admin/companies"
                                        )
                                    }
                                    className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View all
                                </button>

                            </div>


                            <div className="divide-y divide-slate-100">

                                {pendingCompanies.length === 0 ? (

                                    <div className="px-5 py-10 text-center">

                                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />

                                        <p className="mt-3 text-sm font-medium text-slate-700">
                                            No pending companies
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            New company registrations will appear here.
                                        </p>

                                    </div>

                                ) : (

                                    pendingCompanies.map(
                                        (company) => {

                                            const approving =
                                                actionLoading ===
                                                `company-approve-${company._id}`;

                                            const rejecting =
                                                actionLoading ===
                                                `company-reject-${company._id}`;


                                            return (

                                                <div
                                                    key={
                                                        company._id
                                                    }
                                                    className="p-4 sm:p-5"
                                                >

                                                    <div className="flex items-start gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">

                                                            {(
                                                                company.companyName ||
                                                                "C"
                                                            )[0].toUpperCase()}

                                                        </div>


                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex flex-wrap items-center gap-2">

                                                                <p className="text-sm font-semibold text-slate-900">
                                                                    {
                                                                        company.companyName
                                                                    }
                                                                </p>

                                                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                                    Pending
                                                                </span>

                                                            </div>

                                                            <p className="mt-0.5 text-xs text-slate-500">
                                                                {
                                                                    company.industry ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">

                                                        <div>

                                                            <p className="text-slate-400">
                                                                Recruiter
                                                            </p>

                                                            <p className="mt-1 break-words font-medium text-slate-700">
                                                                {
                                                                    company
                                                                        .recruiter
                                                                        ?.name ||
                                                                    company
                                                                        .recruiter
                                                                        ?.email ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </div>


                                                        <div>

                                                            <p className="text-slate-400">
                                                                Submitted
                                                            </p>

                                                            <p className="mt-1 font-medium text-slate-700">
                                                                {formatDate(
                                                                    company.createdAt
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/pending-reviews?type=company&id=${company._id}`
                                                                )
                                                            }
                                                            disabled={
                                                                approving ||
                                                                rejecting
                                                            }
                                                            className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                                        >
                                                            Review
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRejectCompany(
                                                                    company
                                                                )
                                                            }
                                                            disabled={
                                                                approving ||
                                                                rejecting
                                                            }
                                                            className="rounded-lg border border-red-200 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                                        >
                                                            {rejecting
                                                                ? "Rejecting..."
                                                                : "Reject"}
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleApproveCompany(
                                                                    company
                                                                )
                                                            }
                                                            disabled={
                                                                approving ||
                                                                rejecting
                                                            }
                                                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"
                                                        >
                                                            {approving
                                                                ? "Approving..."
                                                                : "Approve"}
                                                        </button>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )

                                )}

                            </div>

                        </section>


                        {/* Pending Jobs */}

                        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">

                            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        Pending Job Posts
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Job postings waiting for Placement Cell approval.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/admin/jobs"
                                        )
                                    }
                                    className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View all
                                </button>

                            </div>


                            <div className="divide-y divide-slate-100">

                                {pendingJobs.length === 0 ? (

                                    <div className="px-5 py-10 text-center">

                                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />

                                        <p className="mt-3 text-sm font-medium text-slate-700">
                                            No pending job postings
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            New job postings will appear here.
                                        </p>

                                    </div>

                                ) : (

                                    pendingJobs.map(
                                        (job) => {

                                            const approving =
                                                actionLoading ===
                                                `job-approve-${job._id}`;

                                            const rejecting =
                                                actionLoading ===
                                                `job-reject-${job._id}`;


                                            const departments =
                                                Array.isArray(
                                                    job.allowedDepartments
                                                )
                                                    ? job.allowedDepartments.join(
                                                        ", "
                                                    )
                                                    : "—";


                                            const eligibility =
                                                `CGPA ${Number(
                                                    job.minimumCGPA
                                                ).toFixed(
                                                    2
                                                )}+ · ${departments} · ${
                                                    job.graduationYear ||
                                                    "—"
                                                }`;


                                            return (

                                                <div
                                                    key={
                                                        job._id
                                                    }
                                                    className="p-4 sm:p-5"
                                                >

                                                    <div className="flex items-start gap-3">

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex flex-wrap items-center gap-2">

                                                                <p className="text-sm font-semibold text-slate-900">
                                                                    {
                                                                        job.title
                                                                    }
                                                                </p>

                                                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                                    Pending
                                                                </span>

                                                            </div>

                                                            <p className="mt-1 text-xs text-slate-500">

                                                                {
                                                                    job
                                                                        .company
                                                                        ?.companyName ||
                                                                    "—"
                                                                }

                                                                {" · "}

                                                                {
                                                                    job.location ||
                                                                    "—"
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">

                                                        <div>

                                                            <p className="text-slate-400">
                                                                Eligibility
                                                            </p>

                                                            <p className="mt-1 break-words font-medium leading-5 text-slate-700">
                                                                {
                                                                    eligibility
                                                                }
                                                            </p>

                                                        </div>


                                                        <div>

                                                            <p className="text-slate-400">
                                                                Submitted
                                                            </p>

                                                            <p className="mt-1 font-medium text-slate-700">
                                                                {formatDate(
                                                                    job.createdAt
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/pending-reviews?type=job&id=${job._id}`
                                                                )
                                                            }
                                                            disabled={
                                                                approving ||
                                                                rejecting
                                                            }
                                                            className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                                        >
                                                            Review
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRejectJob(
                                                                    job
                                                                )
                                                            }
                                                            disabled={
                                                                approving ||
                                                                rejecting
                                                            }
                                                            className="rounded-lg border border-red-200 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                                        >
                                                            {rejecting
                                                                ? "Rejecting..."
                                                                : "Reject"}
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleApproveJob(
                                                                    job
                                                                )
                                                            }
                                                            disabled={
                                                                approving ||
                                                                rejecting
                                                            }
                                                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"
                                                        >
                                                            {approving
                                                                ? "Approving..."
                                                                : "Approve"}
                                                        </button>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )

                                )}

                            </div>

                        </section>

                    </div>


                    {/* Recent Activity */}

                    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">

                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">

                            <div>

                                <h3 className="font-semibold text-slate-900">
                                    Recent Administrative Activity
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Latest approval and rejection actions.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/admin/audit-logs"
                                    )
                                }
                                className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                                View audit logs
                            </button>

                        </div>


                        <div className="divide-y divide-slate-100">

                            {recentActivityEmpty ? (

                                <div className="px-5 py-10 text-center">

                                    <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />

                                    <p className="mt-3 text-sm font-medium text-slate-700">
                                        No administrative activity yet
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Approval and rejection actions will appear here.
                                    </p>

                                </div>

                            ) : (

                                recentActivity.map(
                                    (activity) => {

                                        const approved =
                                            activity.action ===
                                            "APPROVED";


                                        return (

                                            <div
                                                key={
                                                    activity._id
                                                }
                                                className="flex items-start gap-3 px-4 py-4 sm:px-5"
                                            >

                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                        approved
                                                            ? "bg-emerald-50"
                                                            : "bg-red-50"
                                                    }`}
                                                >

                                                    {approved ? (

                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                                                    ) : (

                                                        <XCircle className="h-4 w-4 text-red-600" />

                                                    )}

                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

                                                        <div className="min-w-0">

                                                            <p className="text-sm font-medium text-slate-800">
                                                                {
                                                                    activity.description ||
                                                                    `${activity.targetType} ${activity.action.toLowerCase()}`
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs leading-5 text-slate-500">

                                                                Reviewed by{" "}

                                                                {
                                                                    activity
                                                                        .reviewerId
                                                                        ?.name ||
                                                                    "Placement Admin"
                                                                }

                                                                {" · "}

                                                                {
                                                                    formatDateTime(
                                                                        activity.createdAt
                                                                    )
                                                                }

                                                            </p>

                                                        </div>


                                                        <span
                                                            className={`shrink-0 text-xs font-medium ${
                                                                approved
                                                                    ? "text-emerald-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >

                                                            {approved
                                                                ? "Approved"
                                                                : "Rejected"}

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )

                            )}

                        </div>


                        {!recentActivityEmpty && (

                            <div className="border-t border-slate-200 px-4 py-3 sm:px-5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/admin/audit-logs"
                                        )
                                    }
                                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                                >

                                    View complete activity

                                    <ArrowRight className="h-3.5 w-3.5" />

                                </button>

                            </div>

                        )}

                    </section>

                </main>

            </div>

        </div>

    );
}

export default AdminDashboard;