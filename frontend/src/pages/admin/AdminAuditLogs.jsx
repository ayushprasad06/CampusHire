import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    BriefcaseBusiness,
    LayoutDashboard,
    Building2,
    ClipboardList,
    FileClock,
    ShieldCheck,
    LogOut,
    ChevronDown,
    Search,
    CheckCircle2,
    XCircle,
    Clock3,
    Filter,
    User,
    CalendarDays,
    Building,
    Briefcase,
    Menu,
    X,
    RefreshCw,
    AlertCircle
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import {
    getAuditLogs
} from "../../api/auditLogs.js";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";


// ============================================================
// HELPERS
// ============================================================

const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    ).format(date);
};


const getTargetTypeLabel = (
    targetType
) => {
    if (
        targetType ===
        "Job Posting"
    ) {
        return "Job Posting";
    }

    return "Company";
};


const getTargetIcon = (
    targetType
) => {
    return targetType ===
        "Company"
        ? Building
        : Briefcase;
};


// ============================================================
// ACTION BADGE
// ============================================================

function ActionBadge({
    action
}) {
    const approved =
        action === "APPROVED";

    return (
        <span
            className={
                approved
                    ? "inline-flex min-w-[88px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                    : "inline-flex min-w-[88px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
            }
        >
            {approved ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
                <XCircle className="h-3.5 w-3.5" />
            )}

            {approved
                ? "Approved"
                : "Rejected"}
        </span>
    );
}


// ============================================================
// NAV ITEM
// ============================================================

function NavItem({
    icon: Icon,
    children,
    active,
    onClick
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                active
                    ? "flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-left text-sm font-medium text-blue-700 transition"
                    : "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            }
        >
            <Icon className="h-4 w-4 shrink-0" />

            {children}
        </button>
    );
}


// ============================================================
// SIDEBAR
// ============================================================

function AdminSidebar({
    mobile = false,
    onClose
}) {
    const navigate =
        useNavigate();

    const handleNavigation = (
        path
    ) => {
        navigate(path);

        if (onClose) {
            onClose();
        }
    };

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <div
            className={
                mobile
                    ? "flex h-full w-[270px] flex-col bg-white"
                    : "flex h-full w-[250px] flex-col bg-white"
            }
        >

            {/* ==================================================
                LOGO
            ================================================== */}

            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">

                <div className="flex items-center gap-2.5">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
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
                        onClick={onClose}
                        aria-label="Close navigation"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

            </div>


            {/* ==================================================
                NAVIGATION
            ================================================== */}

            <nav className="flex-1 overflow-y-auto px-3 py-5">

                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Administration
                </p>

                <div className="space-y-1">

                    <NavItem
                        icon={LayoutDashboard}
                        onClick={() =>
                            handleNavigation(
                                "/admin/dashboard"
                            )
                        }
                    >
                        Overview
                    </NavItem>


                    <NavItem
                        icon={Building2}
                        onClick={() =>
                            handleNavigation(
                                "/admin/companies"
                            )
                        }
                    >
                        Companies
                    </NavItem>


                    <NavItem
                        icon={ClipboardList}
                        onClick={() =>
                            handleNavigation(
                                "/admin/jobs"
                            )
                        }
                    >
                        Job Postings
                    </NavItem>


                    <NavItem
                        icon={FileClock}
                        onClick={() =>
                            handleNavigation(
                                "/admin/pending-reviews"
                            )
                        }
                    >
                        Pending Reviews
                    </NavItem>


                    <NavItem
                        icon={ShieldCheck}
                        active
                        onClick={() =>
                            handleNavigation(
                                "/admin/audit-logs"
                            )
                        }
                    >
                        Audit Logs
                    </NavItem>

                </div>

            </nav>


            {/* ==================================================
                ADMIN ACCOUNT
            ================================================== */}

            <div className="shrink-0 border-t border-slate-200 p-3">

                <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        PC
                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-slate-900">
                            Placement Admin
                        </p>

                        <p className="text-xs text-slate-500">
                            Placement Cell
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign out
                </button>

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
    description,
    icon: Icon,
    iconWrapper,
    iconColor
}) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

            <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">

                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>

                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrapper}`}
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
// MOBILE AUDIT CARD
// ============================================================

function AuditMobileCard({
    log
}) {
    const TargetIcon =
        getTargetIcon(
            log.targetType
        );

    return (
        <article className="border-b border-slate-100 p-4 last:border-b-0">

            <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <TargetIcon className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-900">
                            {log.targetName}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                            {getTargetTypeLabel(
                                log.targetType
                            )}
                        </p>

                    </div>

                </div>

                <ActionBadge
                    action={log.action}
                />

            </div>


            <div className="mt-4 rounded-lg bg-slate-50 p-3">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Description
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-600">
                    {log.description}
                </p>

            </div>


            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Reviewer
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>

                        <div className="min-w-0">

                            <p className="truncate text-xs font-medium text-slate-800">
                                {log.reviewerName ||
                                    log.reviewer?.name ||
                                    "Placement Admin"}
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                                {log.reviewerEmail ||
                                    log.reviewer?.email ||
                                    "—"}
                            </p>

                        </div>

                    </div>

                </div>


                <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Timestamp
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600">

                        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                        <span>
                            {formatDateTime(
                                log.createdAt
                            )}
                        </span>

                    </div>

                </div>

            </div>

        </article>
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function AdminAuditLogs() {

    const navigate =
        useNavigate();

    const currentUser =
        getCurrentUser();


    // ========================================================
    // STATE
    // ========================================================

    const [logs, setLogs] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [actionFilter, setActionFilter] =
        useState("ALL");

    const [typeFilter, setTypeFilter] =
        useState("ALL");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);


    // ========================================================
    // LOAD AUDIT LOGS
    // ========================================================

    const loadAuditLogs = async (
        showRefresh = false
    ) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data =
                await getAuditLogs();

            setLogs(
                Array.isArray(
                    data.logs
                )
                    ? data.logs
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load audit logs:",
                err
            );

            setError(
                err.message ||
                "Unable to load audit logs"
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    useEffect(() => {
        loadAuditLogs();
    }, []);


    // ========================================================
    // FILTER LOGS
    // ========================================================

    const filteredLogs =
        useMemo(() => {

            const query =
                search
                    .toLowerCase()
                    .trim();

            return logs.filter(
                (log) => {

                    const target =
                        (
                            log.targetName ||
                            ""
                        ).toLowerCase();

                    const description =
                        (
                            log.description ||
                            ""
                        ).toLowerCase();

                    const reviewer =
                        (
                            log.reviewerName ||
                            log.reviewer?.name ||
                            ""
                        ).toLowerCase();

                    const reviewerEmail =
                        (
                            log.reviewerEmail ||
                            log.reviewer?.email ||
                            ""
                        ).toLowerCase();

                    const reviewerId =
                        (
                            log.reviewerId ||
                            log.reviewer?._id ||
                            ""
                        ).toLowerCase();

                    const matchesSearch =
                        !query ||
                        target.includes(query) ||
                        description.includes(query) ||
                        reviewer.includes(query) ||
                        reviewerEmail.includes(query) ||
                        reviewerId.includes(query);

                    const matchesAction =
                        actionFilter ===
                            "ALL" ||
                        log.action ===
                            actionFilter;

                    const matchesType =
                        typeFilter ===
                            "ALL" ||
                        log.targetType ===
                            typeFilter;

                    return (
                        matchesSearch &&
                        matchesAction &&
                        matchesType
                    );
                }
            );

        }, [
            logs,
            search,
            actionFilter,
            typeFilter
        ]);


    // ========================================================
    // STATS
    // ========================================================

    const approvedCount =
        logs.filter(
            (log) =>
                log.action ===
                "APPROVED"
        ).length;

    const rejectedCount =
        logs.filter(
            (log) =>
                log.action ===
                "REJECTED"
        ).length;


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">


            {/* ==================================================
                DESKTOP SIDEBAR
            ================================================== */}

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] border-r border-slate-200 bg-white lg:block">

                <AdminSidebar />

            </aside>


            {/* ==================================================
                MOBILE OVERLAY
            ================================================== */}

            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
                    onClick={() =>
                        setMobileMenuOpen(false)
                    }
                />
            )}


            {/* ==================================================
                MOBILE SIDEBAR
            ================================================== */}

            <aside
                className={
                    `fixed inset-y-0 left-0 z-50 w-[270px] transform bg-white shadow-xl transition-transform duration-200 lg:hidden ${
                        mobileMenuOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }`
                }
            >

                <AdminSidebar
                    mobile
                    onClose={() =>
                        setMobileMenuOpen(
                            false
                        )
                    }
                />

            </aside>


            {/* ==================================================
                MAIN
            ================================================== */}

            <div className="min-w-0 lg:ml-[250px]">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

                    <div className="flex min-w-0 items-center gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(
                                    true
                                )
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="min-w-0">

                            <h1 className="truncate text-lg font-semibold text-slate-900">
                                Audit Logs
                            </h1>

                            <p className="hidden text-xs text-slate-500 sm:block">
                                Track administrative approvals and rejections
                            </p>

                        </div>

                    </div>


                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">

                        <button
                            type="button"
                            onClick={() =>
                                loadAuditLogs(
                                    true
                                )
                            }
                            disabled={
                                refreshing ||
                                loading
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Refresh audit logs"
                        >
                            <RefreshCw
                                className={
                                    `h-4 w-4 ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }`
                                }
                            />
                        </button>


                        <div className="hidden h-6 w-px bg-slate-200 sm:block" />


                        <div className="flex items-center gap-2 sm:gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                PA
                            </div>

                            <div className="hidden min-w-0 md:block">

                                <p className="truncate text-sm font-medium text-slate-800">
                                    {currentUser?.name ||
                                        "Placement Admin"}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                    {currentUser?.role ===
                                        "ADMIN"
                                        ? "Placement Cell"
                                        : "Administrator"}
                                </p>

                            </div>

                            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />

                        </div>

                    </div>

                </header>


                {/* ==================================================
                    PAGE CONTENT
                ================================================== */}

                <main className="mx-auto w-full max-w-[1250px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">


                    {/* ==================================================
                        INTRO
                    ================================================== */}

                    <div className="mb-6">

                        <h2 className="text-xl font-semibold text-slate-900">
                            Administrative Activity
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Every approval and rejection is recorded with the reviewer and timestamp.
                        </p>

                    </div>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <div className="min-w-0">

                                <p className="text-sm font-semibold text-red-800">
                                    Unable to load audit logs
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadAuditLogs()
                                    }
                                    className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                                >
                                    Try again
                                </button>

                            </div>

                        </div>
                    )}


                    {/* ==================================================
                        SECURITY NOTICE
                    ================================================== */}

                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">

                        <div className="shrink-0 rounded-lg bg-blue-50 p-2">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                        </div>

                        <div className="min-w-0">

                            <p className="text-sm font-semibold text-slate-900">
                                Immutable administrative history
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Audit records identify the administrator who performed the action and when it occurred. These records provide accountability for company and job approval decisions.
                            </p>

                        </div>

                    </div>


                    {/* ==================================================
                        STATS
                    ================================================== */}

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <StatCard
                            label="Total Actions"
                            value={
                                loading
                                    ? "—"
                                    : logs.length
                            }
                            description="Recorded decisions"
                            icon={Clock3}
                            iconWrapper="bg-slate-100"
                            iconColor="text-slate-600"
                        />

                        <StatCard
                            label="Approvals"
                            value={
                                loading
                                    ? "—"
                                    : approvedCount
                            }
                            description="Approved submissions"
                            icon={CheckCircle2}
                            iconWrapper="bg-emerald-50"
                            iconColor="text-emerald-600"
                        />

                        <StatCard
                            label="Rejections"
                            value={
                                loading
                                    ? "—"
                                    : rejectedCount
                            }
                            description="Rejected submissions"
                            icon={XCircle}
                            iconWrapper="bg-red-50"
                            iconColor="text-red-600"
                        />

                    </div>


                    {/* ==================================================
                        AUDIT TABLE
                    ================================================== */}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">


                        {/* ==================================================
                            TOOLBAR
                        ================================================== */}

                        <div className="border-b border-slate-200 p-4 sm:p-5">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        Activity Log
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Administrative decisions recorded by the Placement Cell.
                                    </p>

                                </div>


                                <div className="flex flex-col gap-3 sm:flex-row">

                                    {/* Search */}

                                    <div className="relative">

                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            placeholder="Search activity..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                                        />

                                    </div>


                                    {/* Action Filter */}

                                    <select
                                        value={
                                            actionFilter
                                        }
                                        onChange={(e) =>
                                            setActionFilter(
                                                e.target.value
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="ALL">
                                            All Actions
                                        </option>

                                        <option value="APPROVED">
                                            Approvals
                                        </option>

                                        <option value="REJECTED">
                                            Rejections
                                        </option>
                                    </select>


                                    {/* Type Filter */}

                                    <select
                                        value={
                                            typeFilter
                                        }
                                        onChange={(e) =>
                                            setTypeFilter(
                                                e.target.value
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="ALL">
                                            All Types
                                        </option>

                                        <option value="Company">
                                            Companies
                                        </option>

                                        <option value="Job Posting">
                                            Job Postings
                                        </option>
                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            LOADING
                        ================================================== */}

                        {loading ? (

                            <div className="py-16 text-center">

                                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />

                                <p className="mt-3 text-sm font-medium text-slate-900">
                                    Loading audit logs...
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Fetching administrative activity from the backend.
                                </p>

                            </div>

                        ) : (

                            <>

                                {/* ==================================================
                                    DESKTOP TABLE
                                ================================================== */}

                                <div className="hidden overflow-x-auto lg:block">

                                    <table className="w-full min-w-[1000px]">

                                        <colgroup>
                                            <col className="w-[14%]" />
                                            <col className="w-[22%]" />
                                            <col className="w-[24%]" />
                                            <col className="w-[20%]" />
                                            <col className="w-[20%]" />
                                        </colgroup>


                                        <thead>

                                            <tr className="border-b border-slate-200 bg-slate-50">

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Action
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Target
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Description
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Reviewer
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Timestamp
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {filteredLogs.map(
                                                (log) => {

                                                    const TargetIcon =
                                                        getTargetIcon(
                                                            log.targetType
                                                        );

                                                    return (
                                                        <tr
                                                            key={
                                                                log._id
                                                            }
                                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                                                        >

                                                            {/* Action */}

                                                            <td className="px-5 py-4">

                                                                <ActionBadge
                                                                    action={
                                                                        log.action
                                                                    }
                                                                />

                                                            </td>


                                                            {/* Target */}

                                                            <td className="px-3 py-4">

                                                                <div className="flex min-w-0 items-center gap-2.5">

                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                                                                        <TargetIcon className="h-4 w-4 text-slate-500" />

                                                                    </div>

                                                                    <div className="min-w-0">

                                                                        <p className="truncate text-sm font-medium text-slate-900">
                                                                            {log.targetName}
                                                                        </p>

                                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                                            {getTargetTypeLabel(
                                                                                log.targetType
                                                                            )}
                                                                        </p>

                                                                    </div>

                                                                </div>

                                                            </td>


                                                            {/* Description */}

                                                            <td className="px-3 py-4">

                                                                <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                                                                    {log.description}
                                                                </p>

                                                            </td>


                                                            {/* Reviewer */}

                                                            <td className="px-3 py-4">

                                                                <div className="flex min-w-0 items-center gap-2">

                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">

                                                                        <User className="h-4 w-4 text-blue-600" />

                                                                    </div>

                                                                    <div className="min-w-0">

                                                                        <p className="truncate text-sm font-medium text-slate-800">
                                                                            {log.reviewerName ||
                                                                                log.reviewer?.name ||
                                                                                "Placement Admin"}
                                                                        </p>

                                                                        <p
                                                                            className="truncate text-xs text-slate-500"
                                                                            title={
                                                                                log.reviewerId
                                                                            }
                                                                        >
                                                                            {log.reviewerId ||
                                                                                log.reviewer?._id ||
                                                                                "—"}
                                                                        </p>

                                                                    </div>

                                                                </div>

                                                            </td>


                                                            {/* Timestamp */}

                                                            <td className="px-4 py-4">

                                                                <div className="flex items-center gap-2 text-sm text-slate-600">

                                                                    <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                                                                    <span className="whitespace-nowrap">
                                                                        {formatDateTime(
                                                                            log.createdAt
                                                                        )}
                                                                    </span>

                                                                </div>

                                                            </td>

                                                        </tr>
                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>


                                {/* ==================================================
                                    MOBILE / TABLET CARDS
                                ================================================== */}

                                <div className="lg:hidden">

                                    {filteredLogs.map(
                                        (log) => (
                                            <AuditMobileCard
                                                key={
                                                    log._id
                                                }
                                                log={
                                                    log
                                                }
                                            />
                                        )
                                    )}

                                </div>


                                {/* ==================================================
                                    EMPTY STATE
                                ================================================== */}

                                {filteredLogs.length ===
                                    0 && (
                                    <div className="py-16 text-center">

                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <Filter className="h-5 w-5 text-slate-400" />
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-900">
                                            No audit records found
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Try changing your search or filters.
                                        </p>

                                    </div>
                                )}

                            </>

                        )}


                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                            <p className="text-xs text-slate-500">

                                Showing{" "}

                                <span className="font-medium text-slate-700">
                                    {filteredLogs.length}
                                </span>

                                {" "}of{" "}

                                <span className="font-medium text-slate-700">
                                    {logs.length}
                                </span>

                                {" "}audit records

                            </p>


                            <div className="flex items-center gap-2 text-xs text-slate-500">

                                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />

                                <span>
                                    Reviewer ID and timestamp are retained for accountability.
                                </span>

                            </div>

                        </div>

                    </section>

                </main>

            </div>

        </div>
    );
}


export default AdminAuditLogs;