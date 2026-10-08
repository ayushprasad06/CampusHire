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
    Building,
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
    getAdminJobs,
    approveJob,
    rejectJob
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
// STATUS HELPERS
// ============================================================

const statusStyles = {

    PENDING_REVIEW:
        "border border-amber-100 bg-amber-50 text-amber-700",

    APPROVED:
        "border border-emerald-100 bg-emerald-50 text-emerald-700",

    ACTIVE:
        "border border-blue-100 bg-blue-50 text-blue-700",

    CLOSED:
        "border border-slate-200 bg-slate-100 text-slate-600",

    REJECTED:
        "border border-red-100 bg-red-50 text-red-700"

};


const statusLabels = {

    PENDING_REVIEW:
        "Pending Review",

    APPROVED:
        "Approved",

    ACTIVE:
        "Active",

    CLOSED:
        "Closed",

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

function AdminJobPostings() {

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
        jobs,
        setJobs
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
        selectedJob,
        setSelectedJob
    ] = useState(null);


    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    // ========================================================
    // LOAD JOBS
    // ========================================================

    const loadJobs = async (
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
                await getAdminJobs();


            const loadedJobs =
                Array.isArray(
                    data?.jobs
                )
                    ? data.jobs
                    : [];


            setJobs(
                loadedJobs
            );


            // Keep review panel synchronized
            // if it is currently open.
            if (
                selectedJob
            ) {

                const updatedJob =
                    loadedJobs.find(
                        (job) =>
                            job._id ===
                            selectedJob._id
                    );


                if (
                    updatedJob
                ) {

                    setSelectedJob(
                        updatedJob
                    );

                }

            }

        } catch (err) {

            console.error(
                "Admin jobs error:",
                err
            );

            setError(
                err.message ||
                "Unable to load job postings."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    useEffect(() => {

        loadJobs();

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
    // APPROVE
    // ========================================================

    const handleApprove = async (
        job
    ) => {

        try {

            setActionLoading(
                `approve-${job._id}`
            );

            setError("");

            await approveJob(
                job._id
            );


            await loadJobs(
                true
            );


            setSelectedJob(
                null
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
    // REJECT
    // ========================================================

    const handleReject = async (
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
                `reject-${job._id}`
            );

            setError("");


            await rejectJob(
                job._id,
                reason.trim()
            );


            await loadJobs(
                true
            );


            setSelectedJob(
                null
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
    // FILTER
    // ========================================================

    const filteredJobs =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return jobs.filter(
                (job) => {

                    const title =
                        job?.title ||
                        "";

                    const companyName =
                        job?.company
                            ?.companyName ||
                        "";

                    const recruiterName =
                        job?.createdBy
                            ?.name ||
                        "";

                    const recruiterEmail =
                        job?.createdBy
                            ?.email ||
                        "";

                    const location =
                        job?.location ||
                        "";


                    const matchesSearch =
                        !query ||
                        title
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        companyName
                            .toLowerCase()
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
                            ) ||
                        location
                            .toLowerCase()
                            .includes(
                                query
                            );


                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        job.status ===
                            statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            jobs,
            search,
            statusFilter
        ]);


    // ========================================================
    // COUNTS
    // ========================================================

    const pendingCount =
        jobs.filter(
            (job) =>
                job.status ===
                "PENDING_REVIEW"
        ).length;


    const approvedCount =
        jobs.filter(
            (job) =>
                job.status ===
                "APPROVED"
        ).length;


    const activeCount =
        jobs.filter(
            (job) =>
                job.status ===
                "ACTIVE"
        ).length;


    const rejectedCount =
        jobs.filter(
            (job) =>
                job.status ===
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
                        active
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
            !selectedJob
        ) {

            return null;

        }


        const job =
            selectedJob;


        const approving =
            actionLoading ===
            `approve-${job._id}`;


        const rejecting =
            actionLoading ===
            `reject-${job._id}`;


        const departments =
            Array.isArray(
                job.allowedDepartments
            )
                ? job.allowedDepartments
                : [];


        const skills =
            Array.isArray(
                job.skills
            )
                ? job.skills
                : [];


        const isPending =
            job.status ===
            "PENDING_REVIEW";


        return (

            <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-5">

                <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">

                    {/* Header */}

                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">

                        <div className="flex min-w-0 items-start gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">

                                {(
                                    job.company
                                        ?.companyName ||
                                    "C"
                                )[0].toUpperCase()}

                            </div>


                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                    <h3 className="break-words text-base font-semibold text-slate-900">
                                        {job.title}
                                    </h3>

                                    <StatusBadge
                                        status={
                                            job.status
                                        }
                                    />

                                </div>


                                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">

                                    <span>
                                        {
                                            job.company
                                                ?.companyName ||
                                            "—"
                                        }
                                    </span>

                                    <span className="text-slate-300">
                                        •
                                    </span>

                                    <span>
                                        {
                                            job.employmentType ===
                                            "INTERNSHIP"
                                                ? "Internship"
                                                : "Full-time"
                                        }
                                    </span>

                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setSelectedJob(
                                    null
                                )
                            }
                            aria-label="Close job review"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                        >

                            <X className="h-5 w-5" />

                        </button>

                    </div>


                    {/* Body */}

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">

                        {/* Status Notice */}

                        <div
                            className={`mb-5 rounded-xl border p-4 ${
                                job.status ===
                                "PENDING_REVIEW"

                                    ? "border-amber-200 bg-amber-50"

                                    : job.status ===
                                      "REJECTED"

                                    ? "border-red-200 bg-red-50"

                                    : job.status ===
                                      "ACTIVE"

                                    ? "border-blue-200 bg-blue-50"

                                    : "border-emerald-200 bg-emerald-50"
                            }`}
                        >

                            <div className="flex items-start gap-3">

                                <div className="mt-0.5 shrink-0">

                                    {job.status ===
                                    "PENDING_REVIEW" ? (

                                        <Clock3 className="h-5 w-5 text-amber-600" />

                                    ) : job.status ===
                                      "REJECTED" ? (

                                        <XCircle className="h-5 w-5 text-red-600" />

                                    ) : job.status ===
                                      "ACTIVE" ? (

                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />

                                    ) : (

                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                                    )}

                                </div>


                                <div className="min-w-0">

                                    <p className="text-sm font-semibold">

                                        {job.status ===
                                        "PENDING_REVIEW"

                                            ? "Awaiting Placement Cell approval"

                                            : job.status ===
                                              "REJECTED"

                                            ? "Job posting rejected"

                                            : job.status ===
                                              "APPROVED"

                                            ? "Approved by Placement Cell"

                                            : job.status ===
                                              "ACTIVE"

                                            ? "Job posting is active"

                                            : "Job posting is closed"}

                                    </p>


                                    <p className="mt-1 text-xs leading-5">

                                        {job.status ===
                                        "PENDING_REVIEW"

                                            ? "This posting is not visible to students until the Placement Cell approves it."

                                            : job.status ===
                                              "REJECTED"

                                            ? job.rejectionReason ||
                                              "The recruiter must edit and resubmit this posting before it can be reviewed again."

                                            : job.status ===
                                              "APPROVED"

                                            ? "The posting has been approved. The recruiter can activate it when ready."

                                            : job.status ===
                                              "ACTIVE"

                                            ? "Eligible students can currently see and apply to this posting."

                                            : "This posting is currently closed and is not accepting applications."}

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Job Details */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Location
                                </p>

                                <div className="mt-2 flex items-start gap-2">

                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                    <p className="break-words text-sm font-medium text-slate-800">
                                        {job.location ||
                                            "—"}
                                    </p>

                                </div>

                            </div>


                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Employment Type
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <Briefcase className="h-4 w-4 text-slate-400" />

                                    <p className="text-sm font-medium text-slate-800">
                                        {job.employmentType ===
                                        "INTERNSHIP"
                                            ? "Internship"
                                            : "Full-time"}
                                    </p>

                                </div>

                            </div>


                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Minimum CGPA
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <GraduationCap className="h-4 w-4 text-slate-400" />

                                    <p className="text-sm font-semibold text-slate-800">
                                        {job.minimumCGPA !==
                                        undefined
                                            ? Number(
                                                  job.minimumCGPA
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

                                    <CalendarDays className="h-4 w-4 text-slate-400" />

                                    <p className="text-sm font-medium text-slate-800">
                                        {job.graduationYear ||
                                            "—"}
                                    </p>

                                </div>

                            </div>


                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Application Deadline
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <CalendarDays className="h-4 w-4 text-slate-400" />

                                    <p className="text-sm font-medium text-slate-800">
                                        {formatDate(
                                            job.applicationDeadline
                                        )}
                                    </p>

                                </div>

                            </div>


                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Applicants
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <Users className="h-4 w-4 text-slate-400" />

                                    <p className="text-sm font-medium text-slate-800">
                                        {job.applicantsCount ??
                                            0}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Eligibility */}

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

                                {job.description ||
                                    "No job description was provided."}

                            </p>

                        </div>


                        {/* Company */}

                        <div className="mt-4 rounded-lg border border-slate-200 p-4">

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">

                                    {(
                                        job.company
                                            ?.companyName ||
                                        "C"
                                    )[0].toUpperCase()}

                                </div>


                                <div className="min-w-0 flex-1">

                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        Company
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {
                                            job.company
                                                ?.companyName ||
                                            "—"
                                        }
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {
                                            job.company
                                                ?.industry ||
                                            "Industry not specified"
                                        }
                                    </p>

                                </div>


                                {job.company
                                    ?.website && (

                                    <a
                                        href={
                                            job.company.website.startsWith(
                                                "http"
                                            )
                                                ? job.company.website
                                                : `https://${job.company.website}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                                        title="Visit company website"
                                    >

                                        <ExternalLink className="h-4 w-4" />

                                    </a>

                                )}

                            </div>

                        </div>


                        {/* Recruiter */}

                        <div className="mt-4 rounded-lg border border-slate-200 p-4">

                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Submitted By
                            </p>

                            <div className="mt-2 flex items-start gap-2">

                                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                <div className="min-w-0">

                                    <p className="break-words text-sm font-medium text-slate-800">
                                        {
                                            job.createdBy
                                                ?.name ||
                                            "—"
                                        }
                                    </p>

                                    <p className="mt-1 break-all text-xs text-slate-500">
                                        {
                                            job.createdBy
                                                ?.email ||
                                            "—"
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Dates */}

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Submitted
                                </p>

                                <p className="mt-2 text-sm font-medium text-slate-800">
                                    {formatDateTime(
                                        job.createdAt
                                    )}
                                </p>

                            </div>


                            <div className="rounded-lg border border-slate-200 p-4">

                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Last Approval Review
                                </p>

                                <p className="mt-2 text-sm font-medium text-slate-800">

                                    {job.approvedAt
                                        ? formatDateTime(
                                              job.approvedAt
                                          )
                                        : "Not reviewed"}

                                </p>

                            </div>

                        </div>


                        {/* Rejection Reason */}

                        {job.rejectionReason && (

                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">

                                <div className="flex items-start gap-2">

                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                                    <div>

                                        <p className="text-xs font-semibold text-red-800">
                                            Rejection Reason
                                        </p>

                                        <p className="mt-1 text-sm leading-5 text-red-700">
                                            {
                                                job.rejectionReason
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* Footer */}

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                        <ActionButton
                            onClick={() =>
                                setSelectedJob(
                                    null
                                )
                            }
                            className="w-full sm:w-auto"
                        >
                            Close
                        </ActionButton>


                        {isPending && (

                            <>

                                <ActionButton
                                    variant="danger"
                                    onClick={() =>
                                        handleReject(
                                            job
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
                                        : "Reject Job"}

                                </ActionButton>


                                <ActionButton
                                    variant="primary"
                                    onClick={() =>
                                        handleApprove(
                                            job
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
                                        : "Approve Job"}

                                </ActionButton>

                            </>

                        )}

                    </div>

                </div>

            </div>

        );

    };


    // ========================================================
    // MOBILE CARD
    // ========================================================

    const JobMobileCard = ({
        job
    }) => {

        const approving =
            actionLoading ===
            `approve-${job._id}`;


        const rejecting =
            actionLoading ===
            `reject-${job._id}`;


        const departments =
            Array.isArray(
                job.allowedDepartments
            )
                ? job.allowedDepartments
                : [];


        return (

            <article className="border-b border-slate-100 p-4 last:border-b-0 sm:p-5">

                <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">

                        {(
                            job.company
                                ?.companyName ||
                            "C"
                        )[0].toUpperCase()}

                    </div>


                    <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                            <h4 className="break-words text-sm font-semibold text-slate-900">
                                {job.title}
                            </h4>

                            <StatusBadge
                                status={
                                    job.status
                                }
                            />

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
                            Eligibility
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                            CGPA{" "}
                            {Number(
                                job.minimumCGPA
                            ).toFixed(2)}
                            +
                        </p>

                        <p className="mt-0.5 break-words text-xs text-slate-500">
                            {departments.join(
                                ", "
                            )}
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


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Deadline
                        </p>

                        <p className="mt-1 text-xs text-slate-700">
                            {formatDate(
                                job.applicationDeadline
                            )}
                        </p>

                    </div>


                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Applicants
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                            {
                                job.applicantsCount ??
                                0
                            }
                        </p>

                    </div>

                </div>


                <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5">

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Recruiter
                    </p>

                    <p className="mt-1 break-words text-xs text-slate-700">
                        {
                            job.createdBy
                                ?.name ||
                            "—"
                        }
                    </p>

                </div>


                {job.rejectionReason && (

                    <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">

                        <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">
                            Rejection Reason
                        </p>

                        <p className="mt-1 break-words text-xs leading-5 text-red-700">
                            {
                                job.rejectionReason
                            }
                        </p>

                    </div>

                )}


                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                    <ActionButton
                        icon={Eye}
                        className="w-full"
                        onClick={() =>
                            setSelectedJob(
                                job
                            )
                        }
                        disabled={
                            approving ||
                            rejecting
                        }
                    >
                        Review
                    </ActionButton>


                    {job.status ===
                        "PENDING_REVIEW" && (

                        <>

                            <ActionButton
                                variant="danger"
                                className="w-full"
                                onClick={() =>
                                    handleReject(
                                        job
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
                                className="w-full"
                                onClick={() =>
                                    handleApprove(
                                        job
                                    )
                                }
                                disabled={
                                    approving ||
                                    rejecting
                                }
                            >

                                {approving
                                    ? "Approving..."
                                    : "Approve"}

                            </ActionButton>

                        </>

                    )}

                </div>

            </article>

        );

    };


    // ========================================================
    // DESKTOP TABLE ROW
    // ========================================================

    const JobTableRow = ({
        job
    }) => {

        const approving =
            actionLoading ===
            `approve-${job._id}`;


        const rejecting =
            actionLoading ===
            `reject-${job._id}`;


        const departments =
            Array.isArray(
                job.allowedDepartments
            )
                ? job.allowedDepartments
                : [];


        return (

            <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">

                {/* Job */}

                <td className="px-5 py-4">

                    <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-900">
                            {job.title}
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                            <span className="text-xs text-slate-500">
                                {job.employmentType ===
                                "INTERNSHIP"
                                    ? "Internship"
                                    : "Full-time"}
                            </span>

                            <span className="text-slate-300">
                                •
                            </span>

                            <span className="text-xs text-slate-500">
                                {
                                    job.applicantsCount ??
                                    0
                                }{" "}
                                applicants
                            </span>

                        </div>

                    </div>

                </td>


                {/* Company */}

                <td className="px-3 py-4">

                    <div className="flex min-w-0 items-center gap-2">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">

                            {(
                                job.company
                                    ?.companyName ||
                                "C"
                            )[0].toUpperCase()}

                        </div>


                        <span className="truncate text-sm font-medium text-slate-700">

                            {
                                job.company
                                    ?.companyName ||
                                "—"
                            }

                        </span>

                    </div>

                </td>


                {/* Location */}

                <td className="px-3 py-4">

                    <div className="flex min-w-0 items-center gap-1.5 text-sm text-slate-600">

                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                        <span className="truncate">

                            {
                                job.location ||
                                "—"
                            }

                        </span>

                    </div>

                </td>


                {/* Eligibility */}

                <td className="px-3 py-4">

                    <div className="space-y-1">

                        <div className="flex items-center gap-1.5">

                            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="text-xs font-medium text-slate-700">

                                CGPA{" "}

                                {Number(
                                    job.minimumCGPA
                                ).toFixed(
                                    2
                                )}

                                +

                            </span>

                        </div>


                        <p className="truncate text-xs text-slate-500">

                            {
                                departments.length >
                                0
                                    ? departments.join(
                                          ", "
                                      )
                                    : "No departments"
                            }

                        </p>


                        <p className="text-xs text-slate-500">

                            Class of{" "}

                            {
                                job.graduationYear ||
                                "—"
                            }

                        </p>

                    </div>

                </td>


                {/* Status */}

                <td className="px-3 py-4">

                    <StatusBadge
                        status={
                            job.status
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
                                setSelectedJob(
                                    job
                                )
                            }
                            disabled={
                                approving ||
                                rejecting
                            }
                        >
                            Review
                        </ActionButton>


                        {job.status ===
                            "PENDING_REVIEW" && (

                            <>

                                <ActionButton
                                    variant="danger"
                                    className="w-[62px]"
                                    onClick={() =>
                                        handleReject(
                                            job
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
                                        handleApprove(
                                            job
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

            {/* Mobile navigation */}

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


            {/* Desktop sidebar */}

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">

                <SidebarContent />

            </aside>


            {/* Main */}

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
                                Job Postings
                            </h1>

                            <p className="hidden truncate text-xs text-slate-500 sm:block">
                                Review job postings before they become visible to students
                            </p>

                        </div>

                    </div>


                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">

                        <button
                            type="button"
                            onClick={() =>
                                loadJobs(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                            title="Refresh job postings"
                            aria-label="Refresh job postings"
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


                {/* Content */}

                <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                    <div className="mb-5 sm:mb-6">

                        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                            Job Posting Management
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                            Review eligibility criteria and approve opportunities before students can apply.
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


                    {/* Notice */}

                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">

                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                        <div>

                            <p className="text-sm font-semibold text-blue-900">
                                Approval controls student visibility
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-800">
                                A job posting must be approved by the Placement Cell before the recruiter can activate it for eligible students. Company approval and job approval are handled separately.
                            </p>

                        </div>

                    </div>


                    {/* Stats */}

                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

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
                            label="Active"
                            value={
                                activeCount
                            }
                            icon={Briefcase}
                            iconWrapper="bg-blue-50"
                            iconColor="text-blue-600"
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


                    {/* Jobs section */}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                        {/* Toolbar */}

                        <div className="border-b border-slate-200 p-4 sm:p-5">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div className="min-w-0">

                                    <h3 className="font-semibold text-slate-900">
                                        Registered Job Postings
                                    </h3>

                                    <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                                        Review job details, eligibility, recruiter information, and approval status.
                                    </p>

                                </div>


                                <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px] lg:flex lg:w-auto lg:shrink-0 lg:items-center">

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
                                            placeholder="Search job postings..."
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    {/* Filter */}

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
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-[180px]"
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

                                        <option value="ACTIVE">
                                            Active
                                        </option>

                                        <option value="CLOSED">
                                            Closed
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

                            <div className="flex min-h-[320px] items-center justify-center px-5">

                                <div className="flex items-center gap-3 text-sm text-slate-600">

                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                                    Loading job postings...

                                </div>

                            </div>

                        ) : (

                            <>

                                {/* Desktop table */}

                                <div className="hidden overflow-hidden lg:block">

                                    <table className="w-full table-fixed">

                                        <colgroup>

                                            <col className="w-[21%]" />
                                            <col className="w-[14%]" />
                                            <col className="w-[13%]" />
                                            <col className="w-[20%]" />
                                            <col className="w-[13%]" />
                                            <col className="w-[19%]" />

                                        </colgroup>


                                        <thead>

                                            <tr className="border-b border-slate-200 bg-slate-50">

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Job Posting
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Company
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Location
                                                </th>

                                                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Eligibility
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

                                            {filteredJobs.map(
                                                (
                                                    job
                                                ) => (

                                                    <JobTableRow
                                                        key={
                                                            job._id
                                                        }
                                                        job={
                                                            job
                                                        }
                                                    />

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>


                                {/* Mobile */}

                                <div className="lg:hidden">

                                    {filteredJobs.map(
                                        (
                                            job
                                        ) => (

                                            <JobMobileCard
                                                key={
                                                    job._id
                                                }
                                                job={
                                                    job
                                                }
                                            />

                                        )
                                    )}

                                </div>


                                {/* Empty */}

                                {filteredJobs.length ===
                                    0 && (

                                    <div className="px-5 py-16 text-center">

                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                                            <ClipboardList className="h-5 w-5 text-slate-400" />

                                        </div>


                                        <p className="mt-3 text-sm font-medium text-slate-900">
                                            No job postings found
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
                                        filteredJobs.length
                                    }
                                </span>

                                {" "}of{" "}

                                <span className="font-medium text-slate-700">
                                    {jobs.length}
                                </span>

                                {" "}job postings

                            </p>


                            <div className="flex min-w-0 items-start gap-2 text-xs text-slate-500 sm:items-center">

                                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" />

                                <span className="leading-5">
                                    Only active postings are visible to eligible students.
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


export default AdminJobPostings;