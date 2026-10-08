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
    Eye,
    Users,
    Globe,
    MapPin,
    Menu,
    X,
    Mail,
    CalendarDays,
    ExternalLink,
    RefreshCw,
    AlertCircle,
    Briefcase
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

import {
    getAdminCompanies,
    approveCompany,
    rejectCompany
} from "../../api/admin.js";


// ============================================================
// HELPERS
// ============================================================

const formatDate = (value) => {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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


const getInitials = (
    name
) => {

    return (
        String(
            name || "Admin"
        )
            .split(" ")
            .filter(Boolean)
            .map(
                (part) =>
                    part[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() ||
        "PC"
    );
};


// ============================================================
// STATUS
// ============================================================

const statusStyles = {

    PENDING_REVIEW:
        "bg-amber-50 text-amber-700 border border-amber-100",

    APPROVED:
        "bg-emerald-50 text-emerald-700 border border-emerald-100",

    REJECTED:
        "bg-red-50 text-red-700 border border-red-100"

};


const statusLabels = {

    PENDING_REVIEW:
        "Pending Review",

    APPROVED:
        "Approved",

    REJECTED:
        "Rejected"

};


function StatusBadge({
    status
}) {

    return (

        <span
            className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${
                statusStyles[status] ||
                "border border-slate-200 bg-slate-50 text-slate-600"
            }`}
        >

            {
                statusLabels[status] ||
                status ||
                "Unknown"
            }

        </span>

    );
}


// ============================================================
// NAVIGATION ITEM
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
// STAT CARD
// ============================================================

function StatCard({
    label,
    value,
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
// ACTION BUTTON
// ============================================================

function ActionButton({
    children,
    onClick,
    variant = "default",
    icon: Icon,
    className = "",
    disabled = false
}) {

    const variants = {

        default:
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",

        danger:
            "border border-red-200 bg-white text-red-600 hover:bg-red-50",

        primary:
            "bg-blue-600 text-white hover:bg-blue-700",

        secondary:
            "border border-blue-200 bg-white text-blue-600 hover:bg-blue-50"

    };

    return (

        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
        >

            {Icon && (

                <Icon className="h-3.5 w-3.5 shrink-0" />

            )}

            {children}

        </button>

    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function AdminCompanies() {

    const navigate =
        useNavigate();

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
        companies,
        setCompanies
    ] = useState([]);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");


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


    const [
        selectedCompany,
        setSelectedCompany
    ] = useState(null);


    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    // ========================================================
    // LOAD COMPANIES
    // ========================================================

    const loadCompanies = async (
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
                await getAdminCompanies();

            setCompanies(
                Array.isArray(
                    data?.companies
                )
                    ? data.companies
                    : []
            );

        } catch (err) {

            console.error(
                "Admin companies error:",
                err
            );

            setError(
                err.message ||
                "Unable to load registered companies."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    useEffect(() => {

        loadCompanies();

    }, []);


    // ========================================================
    // NAVIGATION
    // ========================================================

    const navigateAndClose = (
        path
    ) => {

        setMobileMenuOpen(
            false
        );

        navigate(path);

    };


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout = () => {

        logoutUser();

        navigate(
            "/login"
        );

    };


    // ========================================================
    // APPROVE COMPANY
    // ========================================================

    const handleApprove = async (
        company
    ) => {

        try {

            setActionLoading(
                `approve-${company._id}`
            );

            setError("");

            await approveCompany(
                company._id
            );

            setSelectedCompany(
                null
            );

            await loadCompanies(
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


    // ========================================================
    // REJECT / SUSPEND COMPANY
    // ========================================================

    const handleReject = async (
        company
    ) => {

        const reason =
            window.prompt(
                "Enter a rejection reason:",
                company.rejectionReason ||
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
                `reject-${company._id}`
            );

            setError("");

            await rejectCompany(
                company._id,
                reason.trim()
            );

            setSelectedCompany(
                null
            );

            await loadCompanies(
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
    // FILTER
    // ========================================================

    const filteredCompanies =
        useMemo(() => {

            const query =
                search
                    .toLowerCase()
                    .trim();

            return companies.filter(
                (company) => {

                    const recruiterName =
                        company
                            ?.recruiter
                            ?.name ||
                        "";

                    const recruiterEmail =
                        company
                            ?.recruiter
                            ?.email ||
                        "";

                    const matchesSearch =
                        !query ||
                        company.companyName
                            ?.toLowerCase()
                            .includes(
                                query
                            ) ||
                        company.industry
                            ?.toLowerCase()
                            .includes(
                                query
                            ) ||
                        company.location
                            ?.toLowerCase()
                            .includes(
                                query
                            ) ||
                        recruiterName
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        recruiterEmail
                            .toLowerCase()
                            .includes(
                                query
                            );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        company.approvalStatus ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            companies,
            search,
            statusFilter
        ]);


    // ========================================================
    // COUNTS
    // ========================================================

    const pendingCount =
        companies.filter(
            (company) =>
                company.approvalStatus ===
                "PENDING_REVIEW"
        ).length;


    const approvedCount =
        companies.filter(
            (company) =>
                company.approvalStatus ===
                "APPROVED"
        ).length;


    const rejectedCount =
        companies.filter(
            (company) =>
                company.approvalStatus ===
                "REJECTED"
        ).length;


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

                <div className="flex min-w-0 items-center gap-2.5">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">

                        <BriefcaseBusiness className="h-5 w-5 text-white" />

                    </div>

                    <div className="min-w-0">

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
                            setMobileMenuOpen(
                                false
                            )
                        }
                        aria-label="Close navigation"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
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
                        active
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


            {/* Admin */}

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
    // REVIEW MODAL
    // ========================================================

    const ReviewModal = () => {

        if (
            !selectedCompany
        ) {
            return null;
        }

        const company =
            selectedCompany;

        const approving =
            actionLoading ===
            `approve-${company._id}`;

        const rejecting =
            actionLoading ===
            `reject-${company._id}`;


        return (

            <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-5">

                <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">

                    {/* Header */}

                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">

                        <div className="flex min-w-0 items-start gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">

                                {(
                                    company.companyName ||
                                    "C"
                                )[0].toUpperCase()}

                            </div>


                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                    <h3 className="break-words text-base font-semibold text-slate-900">
                                        {company.companyName}
                                    </h3>

                                    <StatusBadge
                                        status={
                                            company.approvalStatus
                                        }
                                    />

                                </div>


                                <p className="mt-1 text-xs text-slate-500">
                                    {company.industry ||
                                        "—"}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setSelectedCompany(
                                    null
                                )
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                            aria-label="Close company review"
                        >

                            <X className="h-5 w-5" />

                        </button>

                    </div>


                    {/* Body */}

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* Recruiter */}

                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Recruiter
                                </p>

                                <div className="mt-2 flex items-start gap-2">

                                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                    <div className="min-w-0">

                                        <p className="break-words text-sm font-medium text-slate-800">
                                            {company.recruiter
                                                ?.name ||
                                                "—"}
                                        </p>

                                        <p className="mt-1 flex items-start gap-1 break-all text-xs text-slate-500">

                                            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                                            {company.recruiter
                                                ?.email ||
                                                "—"}

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Location */}

                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Location
                                </p>

                                <div className="mt-2 flex items-start gap-2">

                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                    <p className="break-words text-sm font-medium text-slate-800">
                                        {company.location ||
                                            "—"}
                                    </p>

                                </div>

                            </div>


                            {/* Employees */}

                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Employees
                                </p>

                                <p className="mt-2 text-sm font-medium text-slate-800">
                                    {company.employeeCount ||
                                        "Not provided"}
                                </p>

                            </div>


                            {/* Jobs */}

                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Job Postings
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <Briefcase className="h-4 w-4 text-slate-400" />

                                    <p className="text-sm font-medium text-slate-800">
                                        {company.jobCount ??
                                            0}
                                    </p>

                                </div>

                            </div>


                            {/* Submitted */}

                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Submitted
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <CalendarDays className="h-4 w-4 text-slate-400" />

                                    <p className="text-sm font-medium text-slate-800">
                                        {formatDateTime(
                                            company.createdAt
                                        )}
                                    </p>

                                </div>

                            </div>


                            {/* Last Review */}

                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Last Review
                                </p>

                                <p className="mt-2 text-sm font-medium text-slate-800">

                                    {company.approvedAt

                                        ? formatDateTime(
                                              company.approvedAt
                                          )

                                        : "Not reviewed"}

                                </p>

                            </div>

                        </div>


                        {/* Website */}

                        <div className="mt-4 rounded-lg border border-slate-200 p-4">

                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Website
                            </p>


                            {company.website ? (

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
                                    className="mt-2 inline-flex max-w-full items-center gap-1.5 break-all text-sm font-medium text-blue-600 hover:text-blue-700"
                                >

                                    {company.website}

                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />

                                </a>

                            ) : (

                                <p className="mt-2 text-sm text-slate-500">
                                    Not provided
                                </p>

                            )}

                        </div>


                        {/* Description */}

                        <div className="mt-4 rounded-lg border border-slate-200 p-4">

                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Description
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">

                                {company.description ||
                                    "No company description was provided."}

                            </p>

                        </div>


                        {/* Rejection Reason */}

                        {company.rejectionReason && (

                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">
                                    Rejection Reason
                                </p>

                                <p className="mt-2 text-sm leading-6 text-red-800">
                                    {company.rejectionReason}
                                </p>

                            </div>

                        )}

                    </div>


                    {/* Footer */}

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                        <ActionButton
                            onClick={() =>
                                setSelectedCompany(
                                    null
                                )
                            }
                            className="w-full sm:w-auto"
                        >
                            Close
                        </ActionButton>


                        {company.approvalStatus ===
                            "PENDING_REVIEW" && (

                            <>

                                <ActionButton
                                    variant="danger"
                                    onClick={() =>
                                        handleReject(
                                            company
                                        )
                                    }
                                    disabled={
                                        approving ||
                                        rejecting
                                    }
                                    className="w-full sm:w-auto"
                                >

                                    {rejecting
                                        ? "Rejecting..."
                                        : "Reject Company"}

                                </ActionButton>


                                <ActionButton
                                    variant="primary"
                                    onClick={() =>
                                        handleApprove(
                                            company
                                        )
                                    }
                                    disabled={
                                        approving ||
                                        rejecting
                                    }
                                    className="w-full sm:w-auto"
                                >

                                    {approving
                                        ? "Approving..."
                                        : "Approve Company"}

                                </ActionButton>

                            </>

                        )}


                        {company.approvalStatus ===
                            "APPROVED" && (

                            <ActionButton
                                variant="danger"
                                onClick={() =>
                                    handleReject(
                                        company
                                    )
                                }
                                disabled={
                                    approving ||
                                    rejecting
                                }
                                className="w-full sm:w-auto"
                            >

                                {rejecting
                                    ? "Suspending..."
                                    : "Suspend Company"}

                            </ActionButton>

                        )}


                        {company.approvalStatus ===
                            "REJECTED" && (

                            <ActionButton
                                variant="primary"
                                onClick={() =>
                                    handleApprove(
                                        company
                                    )
                                }
                                disabled={
                                    approving ||
                                    rejecting
                                }
                                className="w-full sm:w-auto"
                            >

                                {approving
                                    ? "Reconsidering..."
                                    : "Reconsider Company"}

                            </ActionButton>

                        )}

                    </div>

                </div>

            </div>

        );

    };


    // ========================================================
    // MOBILE COMPANY CARD
    // ========================================================

    const CompanyMobileCard = ({
        company
    }) => {

        const approving =
            actionLoading ===
            `approve-${company._id}`;

        const rejecting =
            actionLoading ===
            `reject-${company._id}`;


        return (

            <article className="border-b border-slate-100 p-4 last:border-b-0 sm:p-5">

                <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">

                        {(
                            company.companyName ||
                            "C"
                        )[0].toUpperCase()}

                    </div>


                    <div className="min-w-0 flex-1">

                        <div className="flex min-w-0 flex-wrap items-center gap-2">

                            <h4 className="break-words text-sm font-semibold text-slate-900">
                                {company.companyName}
                            </h4>

                            <StatusBadge
                                status={
                                    company.approvalStatus
                                }
                            />

                        </div>


                        <p className="mt-1 break-words text-xs text-slate-500">
                            {company.industry ||
                                "—"}
                        </p>

                    </div>

                </div>


                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Recruiter
                        </p>

                        <div className="mt-1.5 flex items-start gap-1.5">

                            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <p className="break-words text-xs text-slate-700">
                                {company.recruiter
                                    ?.name ||
                                    "—"}
                            </p>

                        </div>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Location
                        </p>

                        <div className="mt-1.5 flex items-start gap-1.5">

                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <p className="break-words text-xs text-slate-700">
                                {company.location ||
                                    "—"}
                            </p>

                        </div>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Jobs
                        </p>

                        <p className="mt-1.5 text-xs font-medium text-slate-800">
                            {company.jobCount ??
                                0}
                        </p>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Submitted
                        </p>

                        <p className="mt-1.5 text-xs text-slate-700">
                            {formatDate(
                                company.createdAt
                            )}
                        </p>

                    </div>

                </div>


                <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5">

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Website
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-600">
                        {company.website ||
                            "Not provided"}
                    </p>

                </div>


                <div className="mt-4 border-t border-slate-100 pt-4">

                    <div className="grid grid-cols-2 gap-2">

                        <ActionButton
                            icon={Eye}
                            className="w-full"
                            onClick={() =>
                                setSelectedCompany(
                                    company
                                )
                            }
                            disabled={
                                approving ||
                                rejecting
                            }
                        >
                            Review
                        </ActionButton>


                        {company.approvalStatus ===
                            "PENDING_REVIEW" && (

                            <>

                                <ActionButton
                                    variant="danger"
                                    className="w-full"
                                    onClick={() =>
                                        handleReject(
                                            company
                                        )
                                    }
                                    disabled={
                                        approving ||
                                        rejecting
                                    }
                                >

                                    {rejecting
                                        ? "Rejecting..."
                                        : "Reject"}

                                </ActionButton>


                                <ActionButton
                                    variant="primary"
                                    className="col-span-2 w-full"
                                    onClick={() =>
                                        handleApprove(
                                            company
                                        )
                                    }
                                    disabled={
                                        approving ||
                                        rejecting
                                    }
                                >

                                    {approving
                                        ? "Approving..."
                                        : "Approve Company"}

                                </ActionButton>

                            </>

                        )}


                        {company.approvalStatus ===
                            "APPROVED" && (

                            <ActionButton
                                variant="danger"
                                className="col-span-2 w-full"
                                onClick={() =>
                                    handleReject(
                                        company
                                    )
                                }
                                disabled={
                                    approving ||
                                    rejecting
                                }
                            >

                                {rejecting
                                    ? "Suspending..."
                                    : "Suspend Company"}

                            </ActionButton>

                        )}


                        {company.approvalStatus ===
                            "REJECTED" && (

                            <ActionButton
                                variant="secondary"
                                className="col-span-2 w-full"
                                onClick={() =>
                                    handleApprove(
                                        company
                                    )
                                }
                                disabled={
                                    approving ||
                                    rejecting
                                }
                            >

                                {approving
                                    ? "Reconsidering..."
                                    : "Reconsider Company"}

                            </ActionButton>

                        )}

                    </div>

                </div>

            </article>

        );

    };


    // ========================================================
    // DESKTOP TABLE ROW
    // ========================================================

    const CompanyTableRow = ({
        company
    }) => {

        const approving =
            actionLoading ===
            `approve-${company._id}`;

        const rejecting =
            actionLoading ===
            `reject-${company._id}`;


        return (

            <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">

                {/* Company */}

                <td className="px-5 py-4">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">

                            {(
                                company.companyName ||
                                "C"
                            )[0].toUpperCase()}

                        </div>


                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-900">
                                {company.companyName}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                {company.industry ||
                                    "—"}
                            </p>

                        </div>

                    </div>

                </td>


                {/* Recruiter */}

                <td className="px-3 py-4">

                    <div className="flex min-w-0 items-center gap-1.5">

                        <Users className="h-4 w-4 shrink-0 text-slate-400" />

                        <span className="truncate text-sm text-slate-700">

                            {company.recruiter
                                ?.name ||
                                company.recruiter
                                    ?.email ||
                                "—"}

                        </span>

                    </div>

                </td>


                {/* Location */}

                <td className="px-3 py-4">

                    <div className="flex min-w-0 items-center gap-1.5 text-sm text-slate-600">

                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                        <span className="truncate">

                            {company.location ||
                                "—"}

                        </span>

                    </div>

                </td>


                {/* Jobs */}

                <td className="px-3 py-4">

                    <span className="text-sm font-medium text-slate-800">

                        {company.jobCount ??
                            0}

                    </span>

                </td>


                {/* Submitted */}

                <td className="px-3 py-4">

                    <span className="whitespace-nowrap text-sm text-slate-600">

                        {formatDate(
                            company.createdAt
                        )}

                    </span>

                </td>


                {/* Status */}

                <td className="px-3 py-4">

                    <StatusBadge
                        status={
                            company.approvalStatus
                        }
                    />

                </td>


                {/* Actions */}

                <td className="px-4 py-4">

                    <div className="flex items-center justify-end gap-1.5">

                        <ActionButton
                            icon={Eye}
                            className="w-[70px]"
                            onClick={() =>
                                setSelectedCompany(
                                    company
                                )
                            }
                            disabled={
                                approving ||
                                rejecting
                            }
                        >
                            Review
                        </ActionButton>


                        {company.approvalStatus ===
                            "PENDING_REVIEW" && (

                            <>

                                <ActionButton
                                    variant="danger"
                                    className="w-[70px]"
                                    onClick={() =>
                                        handleReject(
                                            company
                                        )
                                    }
                                    disabled={
                                        approving ||
                                        rejecting
                                    }
                                >

                                    {rejecting
                                        ? "..."
                                        : "Reject"}

                                </ActionButton>


                                <ActionButton
                                    variant="primary"
                                    className="w-[72px]"
                                    onClick={() =>
                                        handleApprove(
                                            company
                                        )
                                    }
                                    disabled={
                                        approving ||
                                        rejecting
                                    }
                                >

                                    {approving
                                        ? "..."
                                        : "Approve"}

                                </ActionButton>

                            </>

                        )}


                        {company.approvalStatus ===
                            "APPROVED" && (

                            <ActionButton
                                variant="danger"
                                className="w-[72px]"
                                onClick={() =>
                                    handleReject(
                                        company
                                    )
                                }
                                disabled={
                                    approving ||
                                    rejecting
                                }
                            >

                                {rejecting
                                    ? "..."
                                    : "Suspend"}

                            </ActionButton>

                        )}


                        {company.approvalStatus ===
                            "REJECTED" && (

                            <ActionButton
                                variant="secondary"
                                className="w-[82px]"
                                onClick={() =>
                                    handleApprove(
                                        company
                                    )
                                }
                                disabled={
                                    approving ||
                                    rejecting
                                }
                            >

                                {approving
                                    ? "..."
                                    : "Reconsider"}

                            </ActionButton>

                        )}

                    </div>

                </td>

            </tr>

        );

    };


    // ========================================================
    // PAGE
    // ========================================================

    return (

        <div className="min-h-screen overflow-x-hidden bg-slate-50">

            {/* ==================================================
                MOBILE SIDEBAR
            ================================================== */}

            {mobileMenuOpen && (

                <div className="fixed inset-0 z-50 lg:hidden">

                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() =>
                            setMobileMenuOpen(
                                false
                            )
                        }
                        className="absolute inset-0 bg-slate-900/30"
                    />

                    <aside className="relative h-full w-[280px] max-w-[86vw] bg-white shadow-xl">

                        <SidebarContent
                            mobile
                        />

                    </aside>

                </div>

            )}


            {/* ==================================================
                DESKTOP SIDEBAR
            ================================================== */}

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">

                <SidebarContent />

            </aside>


            {/* ==================================================
                MAIN
            ================================================== */}

            <div className="min-w-0 lg:ml-64">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">

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


                        <div className="min-w-0">

                            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                                Companies
                            </h1>

                            <p className="hidden truncate text-xs text-slate-500 sm:block">
                                Review and manage registered companies
                            </p>

                        </div>

                    </div>


                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">

                        <button
                            type="button"
                            onClick={() =>
                                loadCompanies(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Refresh companies"
                            aria-label="Refresh companies"
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


                            <div className="hidden min-w-0 sm:block">

                                <p className="truncate text-sm font-medium text-slate-800">
                                    {adminName}
                                </p>

                                <p className="text-xs text-slate-500">
                                    Placement Cell
                                </p>

                            </div>


                            <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />

                        </div>

                    </div>

                </header>


                {/* ==================================================
                    PAGE
                ================================================== */}

                <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                    {/* Intro */}

                    <div className="mb-5 sm:mb-6">

                        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                            Company Management
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                            Verify company registrations before recruiters can publish opportunities.
                        </p>

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <div className="min-w-0">

                                <p className="text-sm font-semibold text-red-900">
                                    Unable to complete the request
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* Stats */}

                    <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">

                        <StatCard
                            label="Pending Review"
                            value={
                                pendingCount
                            }
                            icon={Clock3}
                            iconWrapper="bg-amber-50"
                            iconColor="text-amber-600"
                        />


                        <StatCard
                            label="Approved"
                            value={
                                approvedCount
                            }
                            icon={CheckCircle2}
                            iconWrapper="bg-emerald-50"
                            iconColor="text-emerald-600"
                        />


                        <StatCard
                            label="Rejected"
                            value={
                                rejectedCount
                            }
                            icon={XCircle}
                            iconWrapper="bg-red-50"
                            iconColor="text-red-600"
                        />

                    </div>


                    {/* Main Card */}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                        {/* Toolbar */}

                        <div className="border-b border-slate-200 p-4 sm:p-5">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div className="min-w-0">

                                    <h3 className="font-semibold text-slate-900">
                                        Registered Companies
                                    </h3>

                                    <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                                        Company approval determines whether recruiters can participate on the platform.
                                    </p>

                                </div>


                                <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px] lg:flex lg:w-auto lg:shrink-0 lg:items-center">

                                    {/* Search */}

                                    <div className="relative min-w-0 lg:w-64 lg:shrink-0">

                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            placeholder="Search companies..."
                                            value={
                                                search
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSearch(
                                                    event.target.value
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    {/* Status */}

                                    <select
                                        value={
                                            statusFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusFilter(
                                                event.target.value
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-[180px] lg:shrink-0"
                                    >

                                        <option value="ALL">
                                            All Statuses
                                        </option>

                                        <option value="PENDING_REVIEW">
                                            Pending Review
                                        </option>

                                        <option value="APPROVED">
                                            Approved
                                        </option>

                                        <option value="REJECTED">
                                            Rejected
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* Loading */}

                        {loading ? (

                            <div className="flex min-h-[300px] items-center justify-center px-5">

                                <div className="flex items-center gap-3 text-sm text-slate-600">

                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                                    Loading companies...

                                </div>

                            </div>

                        ) : (

                            <>

                                {/* Desktop */}

                                <div className="hidden overflow-hidden lg:block">

                                    <table className="w-full table-fixed">

                                        <colgroup>

                                            <col className="w-[20%]" />
                                            <col className="w-[16%]" />
                                            <col className="w-[14%]" />
                                            <col className="w-[6%]" />
                                            <col className="w-[10%]" />
                                            <col className="w-[13%]" />
                                            <col className="w-[21%]" />

                                        </colgroup>


                                        <thead>

                                            <tr className="border-b border-slate-200 bg-slate-50">

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Company
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Recruiter
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Location
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Jobs
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Submitted
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Status
                                                </th>

                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {filteredCompanies.map(
                                                (
                                                    company
                                                ) => (

                                                    <CompanyTableRow
                                                        key={
                                                            company._id
                                                        }
                                                        company={
                                                            company
                                                        }
                                                    />

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>


                                {/* Mobile */}

                                <div className="lg:hidden">

                                    {filteredCompanies.map(
                                        (
                                            company
                                        ) => (

                                            <CompanyMobileCard
                                                key={
                                                    company._id
                                                }
                                                company={
                                                    company
                                                }
                                            />

                                        )
                                    )}

                                </div>


                                {/* Empty */}

                                {filteredCompanies.length ===
                                    0 && (

                                    <div className="px-5 py-16 text-center">

                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                                            <Building2 className="h-5 w-5 text-slate-400" />

                                        </div>


                                        <p className="mt-3 text-sm font-medium text-slate-900">
                                            No companies found
                                        </p>


                                        <p className="mt-1 text-xs text-slate-500">
                                            Try changing your search or status filter.
                                        </p>

                                    </div>

                                )}

                            </>

                        )}


                        {/* Footer */}

                        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                            <p className="text-xs text-slate-500">

                                Showing{" "}

                                <span className="font-medium text-slate-700">
                                    {
                                        filteredCompanies.length
                                    }
                                </span>

                                {" "}of{" "}

                                <span className="font-medium text-slate-700">
                                    {companies.length}
                                </span>

                                {" "}companies

                            </p>


                            <div className="flex min-w-0 items-start gap-2 text-xs text-slate-500 sm:items-center">

                                <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" />

                                <span className="leading-5">
                                    Company verification is required before recruitment activity.
                                </span>

                            </div>

                        </div>

                    </section>

                </main>

            </div>


            {/* Review Modal */}

            <ReviewModal />

        </div>

    );
}

export default AdminCompanies;