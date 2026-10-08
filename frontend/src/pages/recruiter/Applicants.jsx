import React, { useEffect, useMemo, useState } from "react";

import {
    BriefcaseBusiness,
    LayoutDashboard,
    Building2,
    ClipboardList,
    Users,
    LogOut,
    ChevronDown,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    CheckCircle2,
    Clock3,
    UserCheck,
    CalendarDays,
    GraduationCap,
    Mail,
    ChevronLeft,
    ChevronRight,
    CheckSquare,
    Menu,
    X,
    RefreshCw,
    AlertCircle
} from "lucide-react";

import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

import {
    getMyCompany
} from "../../api/companies.js";

import {
    getRecruiterApplications,
    updateApplicationStatus,
    updateApplicationsStatusBatch
} from "../../api/applications.js";


// ============================================================
// CONSTANTS
// ============================================================

const STATUS_OPTIONS = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
    "REJECTED"
];

const statusLabels = {
    APPLIED: "Applied",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview",
    SELECTED: "Selected",
    REJECTED: "Rejected"
};

const statusStyles = {
    APPLIED: "bg-slate-100 text-slate-700",
    UNDER_REVIEW: "bg-blue-50 text-blue-700",
    SHORTLISTED: "bg-violet-50 text-violet-700",
    INTERVIEW: "bg-amber-50 text-amber-700",
    SELECTED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-700"
};


// ============================================================
// HELPERS
// ============================================================

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


const getInitials = (name) => {
    if (!name || !name.trim()) {
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
    return (
        name?.trim()?.charAt(0)?.toUpperCase() ||
        "C"
    );
};


const getStudent = (application) => {
    return application?.student || {};
};


const getJob = (application) => {
    return application?.job || {};
};


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                statusStyles[status] ||
                "bg-slate-100 text-slate-700"
            }`}
        >
            {statusLabels[status] ||
                status ||
                "Unknown"}
        </span>
    );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    icon: Icon,
    label,
    value,
    iconBg,
    iconColor
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">
                        {label}
                    </p>

                    <p className="mt-1.5 text-xl font-semibold text-slate-900 sm:mt-2 sm:text-2xl">
                        {value}
                    </p>
                </div>

                <div
                    className={`shrink-0 rounded-lg p-2.5 sm:p-3 ${iconBg}`}
                >
                    <Icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`}
                    />
                </div>
            </div>
        </div>
    );
}


// ============================================================
// INFO BOX
// ============================================================

function InfoBox({
    label,
    value,
    icon: Icon
}) {
    return (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
            {Icon && (
                <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            )}

            <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    );
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {
    return (
        <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Filter className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-900">
                No candidates found
            </p>

            <p className="mt-1 text-xs text-slate-500">
                Try changing your search or filter criteria.
            </p>
        </div>
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function Applicants() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const currentUser = getCurrentUser();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [recruiter, setRecruiter] =
        useState(currentUser);

    const [company, setCompany] =
        useState(null);

    const [applications, setApplications] =
        useState([]);

    const [selectedIds, setSelectedIds] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [departmentFilter, setDepartmentFilter] =
        useState("ALL");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [actionLoadingId, setActionLoadingId] =
        useState(null);

    const [batchUpdating, setBatchUpdating] =
        useState(false);

    const [error, setError] =
        useState("");

    const [actionError, setActionError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ========================================================
    // OPTIONAL JOB FILTER
    // ========================================================

    const jobIdFilter =
        searchParams.get("jobId") || "";


    // ========================================================
    // LOAD APPLICATIONS
    // ========================================================

    const loadApplicants = async ({
        showLoader = true
    } = {}) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");
            setActionError("");

            const [
                applicationsResult,
                companyResult
            ] = await Promise.allSettled([
                getRecruiterApplications(),
                getMyCompany()
            ]);

            if (
                applicationsResult.status ===
                "rejected"
            ) {
                throw applicationsResult.reason;
            }

            const loadedApplications =
                Array.isArray(
                    applicationsResult.value?.applications
                )
                    ? applicationsResult.value.applications
                    : [];

            setApplications(
                loadedApplications
            );

            if (
                companyResult.status ===
                "fulfilled"
            ) {
                setCompany(
                    companyResult.value?.company ||
                    null
                );
            }

            setSelectedIds([]);
        } catch (err) {
            console.error(
                "Load applicants error:",
                err
            );

            setError(
                err.message ||
                "Unable to load applicants."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    applicationsResult,
                    companyResult
                ] = await Promise.allSettled([
                    getRecruiterApplications(),
                    getMyCompany()
                ]);

                if (cancelled) {
                    return;
                }

                if (
                    applicationsResult.status ===
                    "rejected"
                ) {
                    throw applicationsResult.reason;
                }

                setApplications(
                    Array.isArray(
                        applicationsResult.value?.applications
                    )
                        ? applicationsResult.value.applications
                        : []
                );

                if (
                    companyResult.status ===
                    "fulfilled"
                ) {
                    setCompany(
                        companyResult.value?.company ||
                        null
                    );
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Load applicants error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load applicants."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);


    // ========================================================
    // DERIVED DATA
    // ========================================================

    const departments = useMemo(() => {
        const values = applications
            .map(
                (application) =>
                    getStudent(application)
                        ?.department
            )
            .filter(Boolean);

        return [...new Set(values)].sort();
    }, [applications]);


    const jobFilteredApplications =
        useMemo(() => {
            if (!jobIdFilter) {
                return applications;
            }

            return applications.filter(
                (application) =>
                    String(
                        getJob(application)?._id
                    ) === String(jobIdFilter)
            );
        }, [
            applications,
            jobIdFilter
        ]);


    const filteredApplications =
        useMemo(() => {
            const normalizedSearch =
                search
                    .trim()
                    .toLowerCase();

            return jobFilteredApplications.filter(
                (application) => {
                    const student =
                        getStudent(application);

                    const job =
                        getJob(application);

                    const name =
                        student?.name || "";

                    const email =
                        student?.email || "";

                    const jobTitle =
                        job?.title || "";

                    const matchesSearch =
                        !normalizedSearch ||
                        name
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            ) ||
                        email
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            ) ||
                        jobTitle
                            .toLowerCase()
                            .includes(
                                normalizedSearch
                            );

                    const matchesStatus =
                        statusFilter === "ALL" ||
                        application.status ===
                            statusFilter;

                    const matchesDepartment =
                        departmentFilter ===
                            "ALL" ||
                        student?.department ===
                            departmentFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesDepartment
                    );
                }
            );
        }, [
            jobFilteredApplications,
            search,
            statusFilter,
            departmentFilter
        ]);


    const totalApplicants =
        jobFilteredApplications.length;


    const underReview =
        jobFilteredApplications.filter(
            (application) =>
                application.status ===
                "UNDER_REVIEW"
        ).length;


    const shortlisted =
        jobFilteredApplications.filter(
            (application) =>
                application.status ===
                "SHORTLISTED"
        ).length;


    const selected =
        jobFilteredApplications.filter(
            (application) =>
                application.status ===
                "SELECTED"
        ).length;


    const allVisibleSelected =
        filteredApplications.length > 0 &&
        filteredApplications.every(
            (application) =>
                selectedIds.includes(
                    String(application._id)
                )
        );


    const recruiterName =
        recruiter?.name?.trim() ||
        currentUser?.name?.trim() ||
        "Recruiter";


    const companyName =
        company?.companyName ||
        "Your Company";


    const recruiterInitials =
        getInitials(recruiterName);


    // ========================================================
    // SELECTION
    // ========================================================

    const toggleSelection = (id) => {
        const normalizedId =
            String(id);

        setSelectedIds((current) =>
            current.includes(normalizedId)
                ? current.filter(
                      (selectedId) =>
                          selectedId !==
                          normalizedId
                  )
                : [
                      ...current,
                      normalizedId
                  ]
        );
    };


    const toggleSelectAll = () => {
        const visibleIds =
            filteredApplications.map(
                (application) =>
                    String(application._id)
            );

        if (visibleIds.length === 0) {
            return;
        }

        if (allVisibleSelected) {
            setSelectedIds((current) =>
                current.filter(
                    (id) =>
                        !visibleIds.includes(id)
                )
            );
        } else {
            setSelectedIds((current) => [
                ...new Set([
                    ...current,
                    ...visibleIds
                ])
            ]);
        }
    };


    // ========================================================
    // INDIVIDUAL STATUS UPDATE
    // ========================================================

    const updateApplicantStatus = async (
        applicationId,
        newStatus
    ) => {
        if (!newStatus) {
            return;
        }

        const id =
            String(applicationId);

        const previousApplication =
            applications.find(
                (application) =>
                    String(
                        application._id
                    ) === id
            );

        if (!previousApplication) {
            return;
        }

        if (
            previousApplication.status ===
            newStatus
        ) {
            return;
        }

        try {
            setActionLoadingId(id);
            setActionError("");
            setSuccess("");

            const result =
                await updateApplicationStatus(
                    id,
                    newStatus
                );

            const updatedApplication =
                result?.application;

            if (updatedApplication) {
                setApplications(
                    (current) =>
                        current.map(
                            (application) =>
                                String(
                                    application._id
                                ) === id
                                    ? updatedApplication
                                    : application
                        )
                );
            } else {
                await loadApplicants({
                    showLoader: false
                });
            }

            setSuccess(
                "Application status updated successfully."
            );
        } catch (err) {
            console.error(
                "Update applicant status error:",
                err
            );

            setActionError(
                err.message ||
                "Unable to update application status."
            );
        } finally {
            setActionLoadingId(null);
        }
    };


    // ========================================================
    // BATCH STATUS UPDATE
    // ========================================================

    const updateSelectedStatus = async (
        newStatus
    ) => {
        if (
            !newStatus ||
            selectedIds.length === 0
        ) {
            return;
        }

        const selectedCount =
            selectedIds.length;

        try {
            setBatchUpdating(true);
            setActionError("");
            setSuccess("");

            await updateApplicationsStatusBatch(
                selectedIds,
                newStatus
            );

            await loadApplicants({
                showLoader: false
            });

            setSuccess(
                `${selectedCount} application${
                    selectedCount === 1
                        ? ""
                        : "s"
                } updated successfully.`
            );
        } catch (err) {
            console.error(
                "Batch status update error:",
                err
            );

            setActionError(
                err.message ||
                "Unable to update selected applications."
            );
        } finally {
            setBatchUpdating(false);
        }
    };


    // ========================================================
    // NAVIGATION
    // ========================================================

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    const navigateTo = (path) => {
        closeMobileMenu();
        navigate(path);
    };


    const handleViewApplicant = (
        applicationId
    ) => {
        navigate(
            `/recruiter/applicants/${applicationId}`
        );
    };


    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };


    // ========================================================
    // SIDEBAR
    // ========================================================

    const SidebarContent = ({
        mobile = false
    }) => (
        <div className="flex h-full flex-col">

            {/* Logo */}
            <div
                className={`flex h-16 items-center border-b border-slate-200 ${
                    mobile
                        ? "justify-between px-5"
                        : "px-6"
                }`}
            >
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

                {mobile && (
                    <button
                        type="button"
                        onClick={
                            closeMobileMenu
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>


            {/* Workspace + Account */}
            <nav className="px-3 py-5">

                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Workspace
                </p>

                <div className="space-y-1">

                    <button
                        type="button"
                        onClick={() =>
                            navigateTo(
                                "/recruiter/dashboard"
                            )
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigateTo(
                                "/recruiter/company"
                            )
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        <Building2 className="h-4 w-4" />
                        Company Profile
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigateTo(
                                "/recruiter/jobs"
                            )
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        <ClipboardList className="h-4 w-4" />
                        Job Postings
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigateTo(
                                "/recruiter/applicants"
                            )
                        }
                        className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
                    >
                        <Users className="h-4 w-4" />
                        Applicants
                    </button>

                </div>


                {/* Account is directly after Workspace */}
                <div className="mt-8">

                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Account
                    </p>

                    <button
                        type="button"
                        onClick={
                            handleLogout
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>

                </div>

            </nav>


            {/* Recruiter profile remains at bottom */}
            <div className="mt-auto border-t border-slate-200 p-3">

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


    // ========================================================
    // LOADING SCREEN
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">

                <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
                    <SidebarContent />
                </aside>

                <main className="min-h-screen lg:ml-64">

                    <header className="flex min-h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
                        <div>
                            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />

                            <div className="mt-2 h-3 w-52 animate-pulse rounded bg-slate-100" />
                        </div>
                    </header>

                    <div className="mx-auto w-full max-w-[1250px] px-4 py-6 sm:px-6 lg:px-8">

                        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

                        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-28 animate-pulse rounded-xl bg-white"
                                    />
                                )
                            )}
                        </div>

                        <div className="mt-6 h-96 animate-pulse rounded-xl bg-white" />

                    </div>
                </main>

            </div>
        );
    }


    // ========================================================
    // PAGE
    // ========================================================

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">

            {/* ==================================================
                DESKTOP SIDEBAR
            ================================================== */}

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
                <SidebarContent />
            </aside>


            {/* ==================================================
                MOBILE SIDEBAR
            ================================================== */}

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
                        <SidebarContent mobile />
                    </aside>

                </div>
            )}


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="min-h-screen min-w-0 lg:ml-64">

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
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="min-w-0">

                            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                                Applicants
                            </h1>

                            <p className="hidden text-xs text-slate-500 sm:block">
                                Review and manage candidates for your job postings
                            </p>

                        </div>

                    </div>


                    {/* Header right */}
                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">

                        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">

                            <div className="flex h-7 w-7 items-center justify-center rounded bg-orange-100 text-xs font-bold text-orange-700">
                                {getCompanyInitial(
                                    companyName
                                )}
                            </div>

                            <span className="text-sm font-medium text-slate-700">
                                {companyName}
                            </span>

                        </div>


                        <div className="hidden h-6 w-px bg-slate-200 sm:block" />


                        <div className="flex items-center gap-2 sm:gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                                {recruiterInitials}
                            </div>

                            <div className="hidden sm:block">

                                <p className="text-sm font-medium text-slate-800">
                                    {recruiterName}
                                </p>

                                <p className="text-xs text-slate-500">
                                    Recruiter
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

                    {/* Page heading */}
                    <div className="mb-5 sm:mb-6">

                        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                            Candidate Management
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                            Review candidates, verify application progress, and update hiring status.
                        </p>

                        {jobIdFilter && (
                            <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                                Showing applicants for one job posting
                            </div>
                        )}

                    </div>


                    {/* ==================================================
                        STATS
                    ================================================== */}

                    <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 lg:grid-cols-4">

                        <StatCard
                            icon={Users}
                            label="Total Applicants"
                            value={
                                totalApplicants
                            }
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                        />

                        <StatCard
                            icon={Clock3}
                            label="Under Review"
                            value={
                                underReview
                            }
                            iconBg="bg-amber-50"
                            iconColor="text-amber-600"
                        />

                        <StatCard
                            icon={UserCheck}
                            label="Shortlisted"
                            value={
                                shortlisted
                            }
                            iconBg="bg-violet-50"
                            iconColor="text-violet-600"
                        />

                        <StatCard
                            icon={CheckCircle2}
                            label="Selected"
                            value={
                                selected
                            }
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                        />

                    </div>


                    {/* ==================================================
                        LOAD ERROR
                    ================================================== */}

                    {error && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <div className="min-w-0 flex-1">

                                <p className="text-sm font-semibold text-red-800">
                                    Unable to load applicants
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadApplicants()
                                    }
                                    className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                >
                                    Try again
                                </button>

                            </div>

                        </div>
                    )}


                    {/* ==================================================
                        APPLICANTS CARD
                    ================================================== */}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                        {/* Toolbar */}
                        <div className="border-b border-slate-200 p-4 sm:p-5">

                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        All Candidates
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Candidates who have successfully passed server-side eligibility checks.
                                    </p>

                                </div>


                                {/* Filters */}
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 xl:flex xl:flex-row">

                                    {/* Search */}
                                    <div className="relative sm:col-span-3 xl:col-span-1">

                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            placeholder="Search candidates..."
                                            value={
                                                search
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSearch(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="h-11 w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 xl:w-64"
                                        />

                                    </div>


                                    {/* Department */}
                                    <select
                                        value={
                                            departmentFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDepartmentFilter(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 xl:w-auto"
                                    >

                                        <option value="ALL">
                                            All Departments
                                        </option>

                                        {departments.map(
                                            (
                                                department
                                            ) => (
                                                <option
                                                    key={
                                                        department
                                                    }
                                                    value={
                                                        department
                                                    }
                                                >
                                                    {
                                                        department
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>


                                    {/* Status */}
                                    <select
                                        value={
                                            statusFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusFilter(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-10 xl:w-auto"
                                    >

                                        <option value="ALL">
                                            All Statuses
                                        </option>

                                        {STATUS_OPTIONS.map(
                                            (
                                                status
                                            ) => (
                                                <option
                                                    key={
                                                        status
                                                    }
                                                    value={
                                                        status
                                                    }
                                                >
                                                    {
                                                        statusLabels[
                                                            status
                                                        ]
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            ACTION MESSAGES
                        ================================================== */}

                        {(actionError ||
                            success) && (
                            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">

                                {actionError && (
                                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">

                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                                        <span>
                                            {
                                                actionError
                                            }
                                        </span>

                                    </div>
                                )}

                                {success &&
                                    !actionError && (
                                        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">

                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                                            <span>
                                                {
                                                    success
                                                }
                                            </span>

                                        </div>
                                    )}

                            </div>
                        )}


                        {/* ==================================================
                            BATCH TOOLBAR
                        ================================================== */}

                        {selectedIds.length >
                            0 && (
                            <div className="border-b border-blue-100 bg-blue-50 px-4 py-3 sm:px-5">

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-center gap-2 text-sm font-medium text-blue-800">

                                        <CheckSquare className="h-4 w-4 shrink-0" />

                                        <span>
                                            {
                                                selectedIds.length
                                            }{" "}
                                            candidate
                                            {selectedIds.length >
                                            1
                                                ? "s"
                                                : ""}{" "}
                                            selected
                                        </span>

                                    </div>


                                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">

                                        <span className="text-xs text-blue-700">
                                            Change status:
                                        </span>

                                        <select
                                            defaultValue=""
                                            disabled={
                                                batchUpdating
                                            }
                                            onChange={(
                                                event
                                            ) => {

                                                if (
                                                    event
                                                        .target
                                                        .value
                                                ) {
                                                    updateSelectedStatus(
                                                        event
                                                            .target
                                                            .value
                                                    );

                                                    event.target.value =
                                                        "";
                                                }

                                            }}
                                            className="h-10 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 sm:w-auto"
                                        >

                                            <option
                                                value=""
                                                disabled
                                            >
                                                Select status
                                            </option>

                                            {STATUS_OPTIONS
                                                .filter(
                                                    (
                                                        status
                                                    ) =>
                                                        status !==
                                                        "APPLIED"
                                                )
                                                .map(
                                                    (
                                                        status
                                                    ) => (
                                                        <option
                                                            key={
                                                                status
                                                            }
                                                            value={
                                                                status
                                                            }
                                                        >
                                                            {
                                                                statusLabels[
                                                                    status
                                                                ]
                                                            }
                                                        </option>
                                                    )
                                                )}

                                        </select>


                                        <button
                                            type="button"
                                            disabled={
                                                batchUpdating
                                            }
                                            onClick={() =>
                                                setSelectedIds(
                                                    []
                                                )
                                            }
                                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                                        >
                                            Clear
                                        </button>

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* ==================================================
                            REFRESH BAR
                        ================================================== */}

                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">

                            <p className="text-xs text-slate-500">
                                Showing{" "}
                                <span className="font-medium text-slate-700">
                                    {
                                        filteredApplications.length
                                    }
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-slate-700">
                                    {
                                        jobFilteredApplications.length
                                    }
                                </span>{" "}
                                candidates
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    loadApplicants({
                                        showLoader: false
                                    })
                                }
                                disabled={
                                    refreshing
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                <RefreshCw
                                    className={`h-3.5 w-3.5 ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />

                                Refresh

                            </button>

                        </div>


                        {/* ==================================================
                            DESKTOP TABLE
                        ================================================== */}

                        <div className="hidden overflow-x-auto lg:block">

                            {filteredApplications.length >
                            0 ? (
                                <table className="w-full table-fixed">

                                    <colgroup>
                                        <col className="w-[5%]" />
                                        <col className="w-[25%]" />
                                        <col className="w-[9%]" />
                                        <col className="w-[7%]" />
                                        <col className="w-[11%]" />
                                        <col className="w-[11%]" />
                                        <col className="w-[14%]" />
                                        <col className="w-[18%]" />
                                    </colgroup>


                                    <thead>

                                        <tr className="border-b border-slate-200 bg-slate-50">

                                            <th className="px-5 py-3 text-left">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        allVisibleSelected
                                                    }
                                                    onChange={
                                                        toggleSelectAll
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />

                                            </th>


                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Candidate
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Department
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                CGPA
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Graduation
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Applied
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredApplications.map(
                                            (
                                                application
                                            ) => {

                                                const student =
                                                    getStudent(
                                                        application
                                                    );

                                                const job =
                                                    getJob(
                                                        application
                                                    );

                                                const id =
                                                    String(
                                                        application._id
                                                    );

                                                const isSelected =
                                                    selectedIds.includes(
                                                        id
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            id
                                                        }
                                                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/70 ${
                                                            isSelected
                                                                ? "bg-blue-50/40"
                                                                : ""
                                                        }`}
                                                    >

                                                        {/* Checkbox */}
                                                        <td className="px-5 py-4">

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onChange={() =>
                                                                    toggleSelection(
                                                                        id
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            />

                                                        </td>


                                                        {/* Candidate */}
                                                        <td className="px-4 py-4">

                                                            <div className="flex items-center gap-3">

                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                                                    {getInitials(
                                                                        student?.name
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="truncate text-sm font-medium text-slate-900">
                                                                        {
                                                                            student?.name ||
                                                                            "Candidate"
                                                                        }
                                                                    </p>

                                                                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">

                                                                        <Mail className="h-3 w-3 shrink-0" />

                                                                        <span className="truncate">
                                                                            {
                                                                                student?.email ||
                                                                                "No email"
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                                                        {
                                                                            job?.title ||
                                                                            "Job posting"
                                                                        }
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* Department */}
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm font-medium text-slate-700">
                                                                {
                                                                    student?.department ||
                                                                    "—"
                                                                }
                                                            </span>
                                                        </td>


                                                        {/* CGPA */}
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm font-semibold text-slate-900">
                                                                {
                                                                    student?.cgpa ??
                                                                    "—"
                                                                }
                                                            </span>
                                                        </td>


                                                        {/* Graduation */}
                                                        <td className="px-4 py-4">

                                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">

                                                                <GraduationCap className="h-4 w-4 text-slate-400" />

                                                                {
                                                                    student?.graduationYear ||
                                                                    "—"
                                                                }

                                                            </div>

                                                        </td>


                                                        {/* Applied */}
                                                        <td className="px-4 py-4">

                                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">

                                                                <CalendarDays className="h-4 w-4 text-slate-400" />

                                                                {formatDate(
                                                                    application.createdAt
                                                                )}

                                                            </div>

                                                        </td>


                                                        {/* Status */}
                                                        <td className="px-4 py-4">

                                                            <StatusBadge
                                                                status={
                                                                    application.status
                                                                }
                                                            />

                                                        </td>


                                                        {/* Actions */}
                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center justify-end gap-1.5">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleViewApplicant(
                                                                            id
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    View
                                                                </button>


                                                                <select
                                                                    value={
                                                                        application.status
                                                                    }
                                                                    disabled={
                                                                        actionLoadingId ===
                                                                        id
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateApplicantStatus(
                                                                            id,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="max-w-[120px] rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                                >

                                                                    {STATUS_OPTIONS.map(
                                                                        (
                                                                            status
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    status
                                                                                }
                                                                                value={
                                                                                    status
                                                                                }
                                                                            >
                                                                                {
                                                                                    statusLabels[
                                                                                        status
                                                                                    ]
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}

                                                                </select>


                                                                <button
                                                                    type="button"
                                                                    title="More actions"
                                                                    onClick={() =>
                                                                        handleViewApplicant(
                                                                            id
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>
                            ) : (
                                <EmptyState />
                            )}

                        </div>


                        {/* ==================================================
                            MOBILE / TABLET CARDS
                        ================================================== */}

                        <div className="lg:hidden">

                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">

                                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-slate-600">

                                    <input
                                        type="checkbox"
                                        checked={
                                            allVisibleSelected
                                        }
                                        onChange={
                                            toggleSelectAll
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <span>
                                        {allVisibleSelected
                                            ? "All visible selected"
                                            : "Select all visible"}
                                    </span>

                                </label>


                                <span className="text-xs text-slate-400">
                                    {
                                        filteredApplications.length
                                    }{" "}
                                    candidate
                                    {filteredApplications.length !==
                                    1
                                        ? "s"
                                        : ""}
                                </span>

                            </div>


                            {filteredApplications.length >
                            0 ? (
                                <div className="divide-y divide-slate-100">

                                    {filteredApplications.map(
                                        (
                                            application
                                        ) => {

                                            const student =
                                                getStudent(
                                                    application
                                                );

                                            const job =
                                                getJob(
                                                    application
                                                );

                                            const id =
                                                String(
                                                    application._id
                                                );

                                            const isSelected =
                                                selectedIds.includes(
                                                    id
                                                );

                                            return (
                                                <article
                                                    key={
                                                        id
                                                    }
                                                    className={`p-4 ${
                                                        isSelected
                                                            ? "bg-blue-50/50"
                                                            : "bg-white"
                                                    }`}
                                                >

                                                    <div className="flex items-start gap-3">

                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                isSelected
                                                            }
                                                            onChange={() =>
                                                                toggleSelection(
                                                                    id
                                                                )
                                                            }
                                                            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />


                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-start justify-between gap-3">

                                                                <div className="flex min-w-0 items-center gap-3">

                                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                                                        {getInitials(
                                                                            student?.name
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0">

                                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                                            {
                                                                                student?.name ||
                                                                                "Candidate"
                                                                            }
                                                                        </p>

                                                                        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">

                                                                            <Mail className="h-3 w-3 shrink-0" />

                                                                            <span className="truncate">
                                                                                {
                                                                                    student?.email ||
                                                                                    "No email"
                                                                                }
                                                                            </span>

                                                                        </div>

                                                                    </div>

                                                                </div>


                                                                <StatusBadge
                                                                    status={
                                                                        application.status
                                                                    }
                                                                />

                                                            </div>


                                                            <p className="mt-3 truncate text-xs font-medium text-blue-600">
                                                                {
                                                                    job?.title ||
                                                                    "Job posting"
                                                                }
                                                            </p>


                                                            <div className="mt-3 grid grid-cols-2 gap-2.5">

                                                                <InfoBox
                                                                    label="Department"
                                                                    value={
                                                                        student?.department ||
                                                                        "—"
                                                                    }
                                                                />

                                                                <InfoBox
                                                                    label="CGPA"
                                                                    value={
                                                                        student?.cgpa ??
                                                                        "—"
                                                                    }
                                                                />

                                                                <InfoBox
                                                                    label="Graduation"
                                                                    value={
                                                                        student?.graduationYear ||
                                                                        "—"
                                                                    }
                                                                    icon={
                                                                        GraduationCap
                                                                    }
                                                                />

                                                                <InfoBox
                                                                    label="Applied"
                                                                    value={formatDate(
                                                                        application.createdAt
                                                                    )}
                                                                    icon={
                                                                        CalendarDays
                                                                    }
                                                                />

                                                            </div>


                                                            <div className="mt-4 grid grid-cols-2 gap-2">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleViewApplicant(
                                                                            id
                                                                        )
                                                                    }
                                                                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    View Profile
                                                                </button>


                                                                <select
                                                                    value={
                                                                        application.status
                                                                    }
                                                                    disabled={
                                                                        actionLoadingId ===
                                                                        id
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateApplicantStatus(
                                                                            id,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                                                                >

                                                                    {STATUS_OPTIONS.map(
                                                                        (
                                                                            status
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    status
                                                                                }
                                                                                value={
                                                                                    status
                                                                                }
                                                                            >
                                                                                {
                                                                                    statusLabels[
                                                                                        status
                                                                                    ]
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}

                                                                </select>

                                                            </div>


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleViewApplicant(
                                                                        id
                                                                    )
                                                                }
                                                                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                More actions
                                                            </button>

                                                        </div>

                                                    </div>

                                                </article>
                                            );
                                        }
                                    )}

                                </div>
                            ) : (
                                <EmptyState />
                            )}

                        </div>


                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                            <p className="text-xs text-slate-500">
                                Showing{" "}
                                <span className="font-medium text-slate-700">
                                    {
                                        filteredApplications.length
                                    }
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-slate-700">
                                    {
                                        jobFilteredApplications.length
                                    }
                                </span>{" "}
                                candidates
                            </p>


                            <div className="flex items-center justify-between gap-2 sm:justify-end">

                                <button
                                    type="button"
                                    disabled
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>


                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-xs font-medium text-white"
                                >
                                    1
                                </button>


                                <button
                                    type="button"
                                    disabled
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>

                            </div>

                        </div>

                    </section>

                </main>

            </main>

        </div>
    );
}


export default Applicants;