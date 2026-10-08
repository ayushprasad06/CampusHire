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
    MapPin,
    GraduationCap,
    Users,
    Menu,
    X,
    CalendarDays,
    ExternalLink,
    RefreshCw,
    AlertCircle,
    Briefcase,
    UserRound,
    Code2
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

import {
    getAdminCompanies,
    getAdminJobs,
    approveCompany,
    rejectCompany,
    approveJob,
    rejectJob
} from "../../api/admin.js";


// ============================================================
// HELPERS
// ============================================================

const formatDate = (
    value
) => {

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


const formatDateTime = (
    value
) => {

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
// STATUS BADGE
// ============================================================

function PendingBadge() {

    return (

        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">

            <Clock3 className="h-3.5 w-3.5" />

            Pending Review

        </span>

    );

}


// ============================================================
// TYPE BADGE
// ============================================================

function TypeBadge({
    type
}) {

    const isCompany =
        type === "COMPANY";


    return (

        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                isCompany
                    ? "bg-blue-50 text-blue-700"
                    : "bg-violet-50 text-violet-700"
            }`}
        >

            {isCompany ? (
                <Building2 className="h-3.5 w-3.5" />
            ) : (
                <Briefcase className="h-3.5 w-3.5" />
            )}

            {isCompany
                ? "Company"
                : "Job Posting"}

        </span>

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
    disabled = false,
    className = ""
}) {

    const variants = {

        default:
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",

        primary:
            "bg-blue-600 text-white hover:bg-blue-700",

        danger:
            "border border-red-200 bg-white text-red-600 hover:bg-red-50",

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

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

            <div className="flex items-start justify-between gap-3">

                <div>

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
// MAIN COMPONENT
// ============================================================

function AdminPendingReviews() {

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


    // ========================================================
    // STATE
    // ========================================================

    const [
        companies,
        setCompanies
    ] = useState([]);


    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        typeFilter,
        setTypeFilter
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
        selectedReview,
        setSelectedReview
    ] = useState(null);


    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    // ========================================================
    // LOAD DATA
    // ========================================================

    const loadReviews = async (
        isRefresh = false
    ) => {

        try {

            if (isRefresh) {

                setRefreshing(true);

            } else {

                setLoading(true);

            }

            setError("");


            const [
                companyData,
                jobData
            ] = await Promise.all([

                getAdminCompanies(),

                getAdminJobs()

            ]);


            const allCompanies =
                Array.isArray(
                    companyData?.companies
                )
                    ? companyData.companies
                    : [];


            const allJobs =
                Array.isArray(
                    jobData?.jobs
                )
                    ? jobData.jobs
                    : [];


            // Only items currently awaiting
            // Placement Cell review.
            const pendingCompanies =
                allCompanies.filter(
                    (company) =>
                        company.approvalStatus ===
                        "PENDING_REVIEW"
                );


            const pendingJobs =
                allJobs.filter(
                    (job) =>
                        job.status ===
                        "PENDING_REVIEW"
                );


            setCompanies(
                pendingCompanies
            );

            setJobs(
                pendingJobs
            );


            // Keep modal synchronized
            // with latest backend data.
            if (
                selectedReview
            ) {

                const updatedItem =
                    selectedReview.type ===
                    "COMPANY"

                        ? pendingCompanies.find(
                              (company) =>
                                  company._id ===
                                  selectedReview.item._id
                          )

                        : pendingJobs.find(
                              (job) =>
                                  job._id ===
                                  selectedReview.item._id
                          );


                if (
                    updatedItem
                ) {

                    setSelectedReview(
                        {
                            type:
                                selectedReview.type,
                            item:
                                updatedItem
                        }
                    );

                } else {

                    setSelectedReview(
                        null
                    );

                }

            }

        } catch (err) {

            console.error(
                "Pending reviews error:",
                err
            );

            setError(
                err.message ||
                "Unable to load pending reviews."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    useEffect(() => {

        loadReviews();

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

        navigate(
            path
        );

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

    const handleApproveCompany = async (
        company
    ) => {

        try {

            setActionLoading(
                `approve-company-${company._id}`
            );

            setError("");


            await approveCompany(
                company._id
            );


            setSelectedReview(
                null
            );


            await loadReviews(
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
    // REJECT COMPANY
    // ========================================================

    const handleRejectCompany = async (
        company
    ) => {

        const reason =
            window.prompt(
                "Enter a rejection reason:",
                company.rejectionReason ||
                "Company registration rejected after review"
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
                `reject-company-${company._id}`
            );

            setError("");


            await rejectCompany(
                company._id,
                reason.trim()
            );


            setSelectedReview(
                null
            );


            await loadReviews(
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
    // APPROVE JOB
    // ========================================================

    const handleApproveJob = async (
        job
    ) => {

        try {

            setActionLoading(
                `approve-job-${job._id}`
            );

            setError("");


            await approveJob(
                job._id
            );


            setSelectedReview(
                null
            );


            await loadReviews(
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


    // ========================================================
    // REJECT JOB
    // ========================================================

    const handleRejectJob = async (
        job
    ) => {

        const reason =
            window.prompt(
                "Enter a rejection reason:",
                job.rejectionReason ||
                "Job posting rejected after review"
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
                `reject-job-${job._id}`
            );

            setError("");


            await rejectJob(
                job._id,
                reason.trim()
            );


            setSelectedReview(
                null
            );


            await loadReviews(
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
    // COMBINED REVIEW ITEMS
    // ========================================================

    const reviewItems =
        useMemo(() => {

            const companyItems =
                companies.map(
                    (company) => ({

                        type:
                            "COMPANY",

                        item:
                            company,

                        createdAt:
                            company.createdAt

                    })
                );


            const jobItems =
                jobs.map(
                    (job) => ({

                        type:
                            "JOB",

                        item:
                            job,

                        createdAt:
                            job.createdAt

                    })
                );


            return [
                ...companyItems,
                ...jobItems
            ].sort(
                (
                    a,
                    b
                ) => {

                    const first =
                        new Date(
                            a.createdAt ||
                            0
                        ).getTime();


                    const second =
                        new Date(
                            b.createdAt ||
                            0
                        ).getTime();


                    return (
                        second -
                        first
                    );

                }
            );

        }, [
            companies,
            jobs
        ]);


    // ========================================================
    // FILTER
    // ========================================================

    const filteredReviews =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return reviewItems.filter(
                ({
                    type,
                    item
                }) => {

                    const title =
                        type ===
                        "COMPANY"

                            ? item.companyName ||
                              ""

                            : item.title ||
                              "";


                    const subtitle =
                        type ===
                        "COMPANY"

                            ? item.industry ||
                              ""

                            : item.company
                                  ?.companyName ||
                              "";


                    const recruiter =
                        type ===
                        "COMPANY"

                            ? item.recruiter
                                  ?.name ||
                              ""

                            : item.createdBy
                                  ?.name ||
                              "";


                    const email =
                        type ===
                        "COMPANY"

                            ? item.recruiter
                                  ?.email ||
                              ""

                            : item.createdBy
                                  ?.email ||
                              "";


                    const location =
                        item.location ||
                        "";


                    const matchesSearch =
                        !query ||
                        title
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        subtitle
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        recruiter
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        email
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        location
                            .toLowerCase()
                            .includes(
                                query
                            );


                    const matchesType =
                        typeFilter ===
                            "ALL" ||
                        type ===
                            typeFilter;


                    return (
                        matchesSearch &&
                        matchesType
                    );

                }
            );

        }, [
            reviewItems,
            search,
            typeFilter
        ]);


    // ========================================================
    // COUNTS
    // ========================================================

    const companyCount =
        companies.length;


    const jobCount =
        jobs.length;


    const totalCount =
        companyCount +
        jobCount;


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
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
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
                        active
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


            {/* Account */}

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
            !selectedReview
        ) {

            return null;

        }


        const {
            type,
            item
        } = selectedReview;


        const isCompany =
            type === "COMPANY";


        const approving =
            actionLoading ===
            `approve-${isCompany ? "company" : "job"}-${item._id}`;


        const rejecting =
            actionLoading ===
            `reject-${isCompany ? "company" : "job"}-${item._id}`;


        const departments =
            Array.isArray(
                item.allowedDepartments
            )
                ? item.allowedDepartments
                : [];


        const skills =
            Array.isArray(
                item.skills
            )
                ? item.skills
                : [];


        return (

            <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-5">

                <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">

                    {/* Header */}

                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">

                        <div className="flex min-w-0 items-start gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">

                                {(
                                    isCompany
                                        ? item.companyName
                                        : item.title
                                )?.[0]?.toUpperCase() ||
                                    "C"}

                            </div>


                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                    <h3 className="break-words text-base font-semibold text-slate-900">

                                        {isCompany
                                            ? item.companyName
                                            : item.title}

                                    </h3>


                                    <TypeBadge
                                        type={
                                            type
                                        }
                                    />

                                    <PendingBadge />

                                </div>


                                <p className="mt-1 break-words text-xs text-slate-500">

                                    {isCompany
                                        ? item.industry ||
                                          "Industry not specified"
                                        : item.company
                                              ?.companyName ||
                                          "Company not specified"}

                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setSelectedReview(
                                    null
                                )
                            }
                            aria-label="Close review"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                        >

                            <X className="h-5 w-5" />

                        </button>

                    </div>


                    {/* Body */}

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">

                        {/* Review notice */}

                        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

                            <div className="flex items-start gap-3">

                                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                                <div>

                                    <p className="text-sm font-semibold text-amber-900">
                                        Awaiting Placement Cell review
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-amber-800">

                                        {isCompany
                                            ? "Review the company registration and recruiter details before approving it."
                                            : "Review the job description and eligibility criteria before approving it for the recruiter."}

                                    </p>

                                </div>

                            </div>

                        </div>


                        {isCompany ? (

                            <>
                                {/* Company details */}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Company Name
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="break-words text-sm font-semibold text-slate-800">
                                                {
                                                    item.companyName ||
                                                    "—"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Industry
                                        </p>

                                        <p className="mt-2 break-words text-sm font-medium text-slate-800">
                                            {
                                                item.industry ||
                                                "—"
                                            }
                                        </p>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Location
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="break-words text-sm font-medium text-slate-800">
                                                {
                                                    item.location ||
                                                    "—"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Employees
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <Users className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="break-words text-sm font-medium text-slate-800">
                                                {
                                                    item.employeeCount ||
                                                    "Not specified"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Website
                                        </p>

                                        <div className="mt-2">

                                            {item.website ? (

                                                <a
                                                    href={
                                                        item.website.startsWith(
                                                            "http"
                                                        )
                                                            ? item.website
                                                            : `https://${item.website}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                                                >

                                                    <span className="truncate">
                                                        {
                                                            item.website
                                                        }
                                                    </span>

                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />

                                                </a>

                                            ) : (

                                                <p className="text-sm text-slate-500">
                                                    Not provided
                                                </p>

                                            )}

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Submitted
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="text-sm font-medium text-slate-800">
                                                {formatDateTime(
                                                    item.createdAt
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Company description */}

                                <div className="mt-4 rounded-lg border border-slate-200 p-4">

                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        Company Description
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">

                                        {
                                            item.description ||
                                            "No company description was provided."
                                        }

                                    </p>

                                </div>


                                {/* Recruiter */}

                                <div className="mt-4 rounded-lg border border-slate-200 p-4">

                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        Recruiter
                                    </p>

                                    <div className="mt-3 flex items-start gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">

                                            {getInitials(
                                                item.recruiter
                                                    ?.name
                                            )}

                                        </div>


                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-slate-800">

                                                {
                                                    item.recruiter
                                                        ?.name ||
                                                    "—"
                                                }

                                            </p>


                                            <p className="mt-1 break-all text-xs text-slate-500">

                                                {
                                                    item.recruiter
                                                        ?.email ||
                                                    "—"
                                                }

                                            </p>


                                            {item.recruiter
                                                ?.phone && (

                                                <p className="mt-1 text-xs text-slate-500">

                                                    {
                                                        item.recruiter
                                                            .phone
                                                    }

                                                </p>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </>

                        ) : (

                            <>
                                {/* Job details */}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Company
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="break-words text-sm font-semibold text-slate-800">
                                                {
                                                    item.company
                                                        ?.companyName ||
                                                    "—"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Employment Type
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="text-sm font-medium text-slate-800">

                                                {item.employmentType ===
                                                "INTERNSHIP"
                                                    ? "Internship"
                                                    : "Full-time"}

                                            </p>

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Location
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="break-words text-sm font-medium text-slate-800">
                                                {
                                                    item.location ||
                                                    "—"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Minimum CGPA
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <GraduationCap className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="text-sm font-semibold text-slate-800">

                                                {item.minimumCGPA !==
                                                undefined
                                                    ? Number(
                                                          item.minimumCGPA
                                                      ).toFixed(
                                                          2
                                                      )
                                                    : "—"}

                                            </p>

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Graduation Year
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="text-sm font-medium text-slate-800">
                                                {
                                                    item.graduationYear ||
                                                    "—"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                            Application Deadline
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                                            <p className="text-sm font-medium text-slate-800">
                                                {formatDate(
                                                    item.applicationDeadline
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Departments */}

                                <div className="mt-4 rounded-lg border border-slate-200 p-4">

                                    <div className="flex items-start gap-2">

                                        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                        <div className="min-w-0">

                                            <p className="text-xs font-semibold text-slate-800">
                                                Allowed Departments
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">

                                                {departments.length >
                                                0 ? (

                                                    departments.map(
                                                        (
                                                            department
                                                        ) => (

                                                            <span
                                                                key={
                                                                    department
                                                                }
                                                                className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                                                            >
                                                                {
                                                                    department
                                                                }
                                                            </span>

                                                        )
                                                    )

                                                ) : (

                                                    <span className="text-xs text-slate-400">
                                                        No departments specified
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* Skills */}

                                <div className="mt-4 rounded-lg border border-slate-200 p-4">

                                    <div className="flex items-start gap-2">

                                        <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                        <div className="min-w-0">

                                            <p className="text-xs font-semibold text-slate-800">
                                                Required Skills
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">

                                                {skills.length >
                                                0 ? (

                                                    skills.map(
                                                        (
                                                            skill
                                                        ) => (

                                                            <span
                                                                key={
                                                                    skill
                                                                }
                                                                className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700"
                                                            >
                                                                {
                                                                    skill
                                                                }
                                                            </span>

                                                        )
                                                    )

                                                ) : (

                                                    <span className="text-xs text-slate-400">
                                                        No specific skills listed
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* Description */}

                                <div className="mt-4 rounded-lg border border-slate-200 p-4">

                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        Job Description
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">

                                        {
                                            item.description ||
                                            "No job description was provided."
                                        }

                                    </p>

                                </div>


                                {/* Recruiter */}

                                <div className="mt-4 rounded-lg border border-slate-200 p-4">

                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        Submitted By
                                    </p>

                                    <div className="mt-3 flex items-start gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">

                                            {getInitials(
                                                item.createdBy
                                                    ?.name
                                            )}

                                        </div>


                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-slate-800">

                                                {
                                                    item.createdBy
                                                        ?.name ||
                                                    "—"
                                                }

                                            </p>


                                            <p className="mt-1 break-all text-xs text-slate-500">

                                                {
                                                    item.createdBy
                                                        ?.email ||
                                                    "—"
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Submitted */}

                                <div className="mt-4 rounded-lg border border-slate-200 p-4">

                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        Submitted
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-slate-800">
                                        {formatDateTime(
                                            item.createdAt
                                        )}
                                    </p>

                                </div>

                            </>

                        )}

                    </div>


                    {/* Footer */}

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                        <ActionButton
                            onClick={() =>
                                setSelectedReview(
                                    null
                                )
                            }
                            className="w-full sm:w-auto"
                        >
                            Close
                        </ActionButton>


                        <ActionButton
                            variant="danger"
                            onClick={() =>
                                isCompany
                                    ? handleRejectCompany(
                                          item
                                      )
                                    : handleRejectJob(
                                          item
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
                                : "Reject"}

                        </ActionButton>


                        <ActionButton
                            variant="primary"
                            onClick={() =>
                                isCompany
                                    ? handleApproveCompany(
                                          item
                                      )
                                    : handleApproveJob(
                                          item
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
                                : "Approve"}

                        </ActionButton>

                    </div>

                </div>

            </div>

        );

    };


    // ========================================================
    // COMPANY MOBILE CARD
    // ========================================================

    const CompanyMobileCard = ({
        company
    }) => {

        const approving =
            actionLoading ===
            `approve-company-${company._id}`;


        const rejecting =
            actionLoading ===
            `reject-company-${company._id}`;


        return (

            <article className="border-b border-slate-100 p-4 last:border-b-0">

                <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">

                        {(
                            company.companyName ||
                            "C"
                        )[0].toUpperCase()}

                    </div>


                    <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                            <h4 className="break-words text-sm font-semibold text-slate-900">
                                {
                                    company.companyName
                                }
                            </h4>

                            <PendingBadge />

                        </div>


                        <p className="mt-1 break-words text-xs text-slate-500">

                            {
                                company.industry ||
                                "Industry not specified"
                            }

                        </p>

                    </div>

                </div>


                <div className="mt-4 grid grid-cols-2 gap-3">

                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Recruiter
                        </p>

                        <p className="mt-1 break-words text-xs font-medium text-slate-700">

                            {
                                company.recruiter
                                    ?.name ||
                                "—"
                            }

                        </p>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Submitted
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                            {formatDate(
                                company.createdAt
                            )}
                        </p>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Location
                        </p>

                        <p className="mt-1 flex items-start gap-1 text-xs text-slate-700">

                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="break-words">
                                {
                                    company.location ||
                                    "—"
                                }
                            </span>

                        </p>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Employees
                        </p>

                        <p className="mt-1 text-xs text-slate-700">
                            {
                                company.employeeCount ||
                                "Not specified"
                            }
                        </p>

                    </div>

                </div>


                <div className="mt-4 grid grid-cols-3 gap-2">

                    <ActionButton
                        icon={Eye}
                        onClick={() =>
                            setSelectedReview(
                                {
                                    type:
                                        "COMPANY",
                                    item:
                                        company
                                }
                            )
                        }
                        disabled={
                            approving ||
                            rejecting
                        }
                        className="w-full"
                    >
                        Review
                    </ActionButton>


                    <ActionButton
                        variant="danger"
                        onClick={() =>
                            handleRejectCompany(
                                company
                            )
                        }
                        disabled={
                            approving ||
                            rejecting
                        }
                        className="w-full"
                    >

                        {rejecting
                            ? "..."
                            : "Reject"}

                    </ActionButton>


                    <ActionButton
                        variant="primary"
                        onClick={() =>
                            handleApproveCompany(
                                company
                            )
                        }
                        disabled={
                            approving ||
                            rejecting
                        }
                        className="w-full"
                    >

                        {approving
                            ? "..."
                            : "Approve"}

                    </ActionButton>

                </div>

            </article>

        );

    };


    // ========================================================
    // JOB MOBILE CARD
    // ========================================================

    const JobMobileCard = ({
        job
    }) => {

        const approving =
            actionLoading ===
            `approve-job-${job._id}`;


        const rejecting =
            actionLoading ===
            `reject-job-${job._id}`;


        const departments =
            Array.isArray(
                job.allowedDepartments
            )
                ? job.allowedDepartments
                : [];


        return (

            <article className="border-b border-slate-100 p-4 last:border-b-0">

                <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">

                        {(
                            job.title ||
                            "J"
                        )[0].toUpperCase()}

                    </div>


                    <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                            <h4 className="break-words text-sm font-semibold text-slate-900">
                                {
                                    job.title
                                }
                            </h4>

                            <PendingBadge />

                        </div>


                        <p className="mt-1 break-words text-xs text-slate-500">

                            {
                                job.company
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


                <div className="mt-4 grid grid-cols-2 gap-3">

                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Recruiter
                        </p>

                        <p className="mt-1 break-words text-xs font-medium text-slate-700">

                            {
                                job.createdBy
                                    ?.name ||
                                "—"
                            }

                        </p>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Submitted
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                            {formatDate(
                                job.createdAt
                            )}
                        </p>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Minimum CGPA
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">

                            {job.minimumCGPA !==
                            undefined
                                ? Number(
                                      job.minimumCGPA
                                  ).toFixed(
                                      2
                                  )
                                : "—"}

                            +

                        </p>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Graduation
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                            {
                                job.graduationYear ||
                                "—"
                            }
                        </p>

                    </div>

                </div>


                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5">

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Departments
                    </p>

                    <p className="mt-1 break-words text-xs text-slate-700">

                        {departments.length >
                        0
                            ? departments.join(
                                  ", "
                              )
                            : "No departments specified"}

                    </p>

                </div>


                <div className="mt-4 grid grid-cols-3 gap-2">

                    <ActionButton
                        icon={Eye}
                        onClick={() =>
                            setSelectedReview(
                                {
                                    type:
                                        "JOB",
                                    item:
                                        job
                                }
                            )
                        }
                        disabled={
                            approving ||
                            rejecting
                        }
                        className="w-full"
                    >
                        Review
                    </ActionButton>


                    <ActionButton
                        variant="danger"
                        onClick={() =>
                            handleRejectJob(
                                job
                            )
                        }
                        disabled={
                            approving ||
                            rejecting
                        }
                        className="w-full"
                    >

                        {rejecting
                            ? "..."
                            : "Reject"}

                    </ActionButton>


                    <ActionButton
                        variant="primary"
                        onClick={() =>
                            handleApproveJob(
                                job
                            )
                        }
                        disabled={
                            approving ||
                            rejecting
                        }
                        className="w-full"
                    >

                        {approving
                            ? "..."
                            : "Approve"}

                    </ActionButton>

                </div>

            </article>

        );

    };


    // ========================================================
    // DESKTOP REVIEW ROW
    // ========================================================

    const ReviewTableRow = ({
        review
    }) => {

        const {
            type,
            item
        } = review;


        const isCompany =
            type === "COMPANY";


        const approving =
            actionLoading ===
            `approve-${isCompany ? "company" : "job"}-${item._id}`;


        const rejecting =
            actionLoading ===
            `reject-${isCompany ? "company" : "job"}-${item._id}`;


        const title =
            isCompany
                ? item.companyName
                : item.title;


        const subtitle =
            isCompany
                ? item.industry
                : item.company
                      ?.companyName;


        const recruiter =
            isCompany
                ? item.recruiter
                      ?.name
                : item.createdBy
                      ?.name;


        const location =
            item.location ||
            "—";


        return (

            <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">

                {/* Type */}

                <td className="px-5 py-4">

                    <TypeBadge
                        type={
                            type
                        }
                    />

                </td>


                {/* Item */}

                <td className="px-3 py-4">

                    <div className="flex min-w-0 items-center gap-2.5">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">

                            {(
                                title ||
                                "I"
                            )[0].toUpperCase()}

                        </div>


                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-900">
                                {
                                    title ||
                                    "—"
                                }
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                {
                                    subtitle ||
                                    "—"
                                }
                            </p>

                        </div>

                    </div>

                </td>


                {/* Recruiter */}

                <td className="px-3 py-4">

                    <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-slate-700">
                            {
                                recruiter ||
                                "—"
                            }
                        </p>


                        <p className="mt-0.5 truncate text-xs text-slate-400">

                            {isCompany
                                ? item.recruiter
                                      ?.email ||
                                  "—"
                                : item.createdBy
                                      ?.email ||
                                  "—"}

                        </p>

                    </div>

                </td>


                {/* Location */}

                <td className="px-3 py-4">

                    <div className="flex min-w-0 items-center gap-1.5 text-sm text-slate-600">

                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                        <span className="truncate">
                            {location}
                        </span>

                    </div>

                </td>


                {/* Submitted */}

                <td className="px-3 py-4">

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">

                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                        {formatDate(
                            item.createdAt
                        )}

                    </div>

                </td>


                {/* Status */}

                <td className="px-3 py-4">

                    <PendingBadge />

                </td>


                {/* Actions */}

                <td className="px-4 py-4">

                    <div className="flex items-center justify-end gap-1.5">

                        <ActionButton
                            icon={Eye}
                            className="w-[68px]"
                            onClick={() =>
                                setSelectedReview(
                                    review
                                )
                            }
                            disabled={
                                approving ||
                                rejecting
                            }
                        >
                            Review
                        </ActionButton>


                        <ActionButton
                            variant="danger"
                            className="w-[62px]"
                            onClick={() =>
                                isCompany
                                    ? handleRejectCompany(
                                          item
                                      )
                                    : handleRejectJob(
                                          item
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
                            className="w-[68px]"
                            onClick={() =>
                                isCompany
                                    ? handleApproveCompany(
                                          item
                                      )
                                    : handleApproveJob(
                                          item
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

                {/* Header */}

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
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
                        >

                            <Menu className="h-5 w-5" />

                        </button>


                        <div className="min-w-0">

                            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                                Pending Reviews
                            </h1>

                            <p className="hidden truncate text-xs text-slate-500 sm:block">
                                Review companies and job postings awaiting Placement Cell approval
                            </p>

                        </div>

                    </div>


                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">

                        <button
                            type="button"
                            onClick={() =>
                                loadReviews(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                            title="Refresh pending reviews"
                            aria-label="Refresh pending reviews"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-60"
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


                            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />

                        </div>

                    </div>

                </header>


                {/* ==================================================
                    CONTENT
                ================================================== */}

                <main className="mx-auto w-full max-w-[1250px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                    {/* Intro */}

                    <div className="mb-5 sm:mb-6">

                        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                            Review Queue
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                            Review newly registered companies and job postings before they move into the approved workflow.
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

                                <p className="mt-1 break-words text-xs leading-5 text-red-700">
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* Information notice */}

                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">

                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                        <div>

                            <p className="text-sm font-semibold text-blue-900">
                                Placement Cell approval is required
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-800">
                                Approved companies can continue through the recruiter workflow, while approved job postings can later be activated by their recruiter. Rejected submissions remain out of the student-facing workflow until corrected and resubmitted.
                            </p>

                        </div>

                    </div>


                    {/* ==================================================
                        STATS
                    ================================================== */}

                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">

                        <StatCard
                            label="Total Pending"
                            value={
                                totalCount
                            }
                            icon={Clock3}
                            iconWrapper="bg-amber-50"
                            iconColor="text-amber-600"
                        />


                        <StatCard
                            label="Companies"
                            value={
                                companyCount
                            }
                            icon={Building2}
                            iconWrapper="bg-blue-50"
                            iconColor="text-blue-600"
                        />


                        <StatCard
                            label="Job Posts"
                            value={
                                jobCount
                            }
                            icon={ClipboardList}
                            iconWrapper="bg-violet-50"
                            iconColor="text-violet-600"
                        />

                    </div>


                    {/* ==================================================
                        REVIEW QUEUE
                    ================================================== */}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                        {/* Toolbar */}

                        <div className="border-b border-slate-200 p-4 sm:p-5">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        Pending Submissions
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Every item shown here is currently waiting for an Admin decision.
                                    </p>

                                </div>


                                <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px] lg:flex lg:w-auto lg:shrink-0">

                                    {/* Search */}

                                    <div className="relative min-w-0 lg:w-64">

                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
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
                                            placeholder="Search pending reviews..."
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    {/* Type filter */}

                                    <select
                                        value={
                                            typeFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setTypeFilter(
                                                event.target.value
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-[180px]"
                                    >

                                        <option value="ALL">
                                            All Types
                                        </option>

                                        <option value="COMPANY">
                                            Companies
                                        </option>

                                        <option value="JOB">
                                            Job Postings
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* Loading */}

                        {loading ? (

                            <div className="flex min-h-[320px] items-center justify-center px-5">

                                <div className="flex items-center gap-3 text-sm text-slate-600">

                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                                    Loading pending reviews...

                                </div>

                            </div>

                        ) : (

                            <>

                                {/* Desktop */}

                                <div className="hidden overflow-hidden xl:block">

                                    <table className="w-full min-w-[1180px]">

                                        <colgroup>

                                            <col className="w-[12%]" />
                                            <col className="w-[20%]" />
                                            <col className="w-[18%]" />
                                            <col className="w-[13%]" />
                                            <col className="w-[12%]" />
                                            <col className="w-[11%]" />
                                            <col className="w-[14%]" />

                                        </colgroup>


                                        <thead>

                                            <tr className="border-b border-slate-200 bg-slate-50">

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Type
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Submission
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Recruiter
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Location
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Submitted
                                                </th>

                                                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
    STATUS
</th>

                                                <th className="w-[220px] px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
    ACTIONS
</th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {filteredReviews.map(
                                                (
                                                    review
                                                ) => (

                                                    <ReviewTableRow
                                                        key={`${review.type}-${review.item._id}`}
                                                        review={
                                                            review
                                                        }
                                                    />

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>


                                {/* Tablet */}

                                <div className="hidden md:block xl:hidden">

                                    {filteredReviews.map(
                                        (
                                            review
                                        ) => {

                                            const {
                                                type,
                                                item
                                            } = review;


                                            const isCompany =
                                                type ===
                                                "COMPANY";


                                            return (

                                                <article
                                                    key={`${type}-${item._id}`}
                                                    className="border-b border-slate-100 p-5 last:border-b-0"
                                                >

                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex flex-wrap items-center gap-2">

                                                                <TypeBadge
                                                                    type={
                                                                        type
                                                                    }
                                                                />

                                                                <PendingBadge />

                                                            </div>


                                                            <div className="mt-3 flex items-start gap-3">

                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">

                                                                    {(
                                                                        isCompany
                                                                            ? item.companyName
                                                                            : item.title
                                                                    )?.[0]?.toUpperCase() ||
                                                                        "I"}

                                                                </div>


                                                                <div className="min-w-0">

                                                                    <h4 className="break-words text-sm font-semibold text-slate-900">

                                                                        {isCompany
                                                                            ? item.companyName
                                                                            : item.title}

                                                                    </h4>


                                                                    <p className="mt-1 break-words text-xs text-slate-500">

                                                                        {isCompany
                                                                            ? item.industry
                                                                            : item.company
                                                                                  ?.companyName}

                                                                    </p>

                                                                </div>

                                                            </div>


                                                            <div className="mt-4 grid grid-cols-2 gap-4">

                                                                <div>

                                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                        Recruiter
                                                                    </p>

                                                                    <p className="mt-1 break-words text-xs font-medium text-slate-700">

                                                                        {isCompany
                                                                            ? item.recruiter
                                                                                  ?.name
                                                                            : item.createdBy
                                                                                  ?.name}

                                                                    </p>

                                                                </div>


                                                                <div>

                                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                        Submitted
                                                                    </p>

                                                                    <p className="mt-1 text-xs font-medium text-slate-700">
                                                                        {formatDate(
                                                                            item.createdAt
                                                                        )}
                                                                    </p>

                                                                </div>


                                                                <div>

                                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                        Location
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-slate-700">
                                                                        {
                                                                            item.location ||
                                                                            "—"
                                                                        }
                                                                    </p>

                                                                </div>


                                                                <div>

                                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                        Review Type
                                                                    </p>

                                                                    <p className="mt-1 text-xs font-medium text-slate-700">
                                                                        {isCompany
                                                                            ? "Company registration"
                                                                            : "Job posting"}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </div>


                                                        <div className="flex shrink-0 flex-row gap-2 lg:w-[250px] lg:flex-col">

                                                            <ActionButton
                                                                icon={
                                                                    Eye
                                                                }
                                                                onClick={() =>
                                                                    setSelectedReview(
                                                                        review
                                                                    )
                                                                }
                                                                className="flex-1 lg:w-full"
                                                            >
                                                                Review
                                                            </ActionButton>


                                                            <ActionButton
                                                                variant="danger"
                                                                onClick={() =>
                                                                    isCompany
                                                                        ? handleRejectCompany(
                                                                              item
                                                                          )
                                                                        : handleRejectJob(
                                                                              item
                                                                          )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                className="flex-1 lg:w-full"
                                                            >
                                                                Reject
                                                            </ActionButton>


                                                            <ActionButton
                                                                variant="primary"
                                                                onClick={() =>
                                                                    isCompany
                                                                        ? handleApproveCompany(
                                                                              item
                                                                          )
                                                                        : handleApproveJob(
                                                                              item
                                                                          )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                className="flex-1 lg:w-full"
                                                            >
                                                                Approve
                                                            </ActionButton>

                                                        </div>

                                                    </div>

                                                </article>

                                            );

                                        }
                                    )}

                                </div>


                                {/* Mobile */}

                                <div className="md:hidden">

                                    {filteredReviews.map(
                                        (
                                            review
                                        ) => (

                                            review.type ===
                                            "COMPANY" ? (

                                                <CompanyMobileCard
                                                    key={
                                                        review.item
                                                            ._id
                                                    }
                                                    company={
                                                        review.item
                                                    }
                                                />

                                            ) : (

                                                <JobMobileCard
                                                    key={
                                                        review.item
                                                            ._id
                                                    }
                                                    job={
                                                        review.item
                                                    }
                                                />

                                            )

                                        )
                                    )}

                                </div>


                                {/* Empty */}

                                {filteredReviews.length ===
                                    0 && (

                                    <div className="px-5 py-16 text-center">

                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">

                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                                        </div>


                                        <p className="mt-3 text-sm font-semibold text-slate-900">
                                            No pending reviews
                                        </p>


                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            There are no submissions matching the current filters.
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
                                        filteredReviews.length
                                    }
                                </span>

                                {" "}of{" "}

                                <span className="font-medium text-slate-700">
                                    {
                                        reviewItems.length
                                    }
                                </span>

                                {" "}pending items

                            </p>


                            <div className="flex items-start gap-2 text-xs text-slate-500 sm:items-center">

                                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" />

                                <span className="leading-5">
                                    Every approval or rejection is processed by the backend.
                                </span>

                            </div>

                        </div>

                    </section>

                </main>

            </div>


            {/* Review modal */}

            <ReviewModal />

        </div>

    );

}


export default AdminPendingReviews;