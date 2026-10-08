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
    Users,
    LogOut,
    ChevronDown,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    FileText,
    Download,
    CheckCircle2,
    Clock3,
    CalendarDays,
    UserCheck,
    ExternalLink,
    Menu,
    X,
    AlertCircle,
    RefreshCw
} from "lucide-react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

import {
    getMyCompany
} from "../../api/companies.js";

import {
    getRecruiterApplicationById,
    updateApplicationStatus
} from "../../api/applications.js";


// ============================================================
// STATUS ORDER
// ============================================================

const PROGRESS_STATUSES = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED"
];


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
    APPLIED: {
        badge:
            "bg-slate-100 text-slate-700",

        panel:
            "border-slate-200 bg-slate-50",

        title:
            "text-slate-900",

        text:
            "text-slate-600"
    },

    UNDER_REVIEW: {
        badge:
            "bg-blue-50 text-blue-700",

        panel:
            "border-blue-200 bg-blue-50",

        title:
            "text-blue-900",

        text:
            "text-blue-700"
    },

    SHORTLISTED: {
        badge:
            "bg-violet-50 text-violet-700",

        panel:
            "border-violet-200 bg-violet-50",

        title:
            "text-violet-900",

        text:
            "text-violet-700"
    },

    INTERVIEW: {
        badge:
            "bg-amber-50 text-amber-700",

        panel:
            "border-amber-200 bg-amber-50",

        title:
            "text-amber-900",

        text:
            "text-amber-700"
    },

    SELECTED: {
        badge:
            "bg-emerald-50 text-emerald-700",

        panel:
            "border-emerald-200 bg-emerald-50",

        title:
            "text-emerald-900",

        text:
            "text-emerald-700"
    },

    REJECTED: {
        badge:
            "bg-red-50 text-red-700",

        panel:
            "border-red-200 bg-red-50",

        title:
            "text-red-900",

        text:
            "text-red-700"
    }
};


// ============================================================
// HELPERS
// ============================================================

const getInitials = (
    name
) => {
    if (
        !name ||
        !name.trim()
    ) {
        return "C";
    }

    return name
        .trim()
        .split(/\s+/)
        .map(
            (part) =>
                part[0]
        )
        .join("")
        .slice(0, 2)
        .toUpperCase();
};


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
            day: "numeric",
            year: "numeric"
        }
    );
};


const formatDateTime = (
    value
) => {
    if (!value) {
        return "Pending";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Pending";
    }

    return (
        date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        ) +
        " · " +
        date.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        )
    );
};


const getStatusStyle = (
    status
) => {
    return (
        statusStyles[status] ||
        statusStyles.APPLIED
    );
};


const getStatusIndex = (
    status
) => {
    return PROGRESS_STATUSES.indexOf(
        status
    );
};


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
    status
}) {
    const style =
        getStatusStyle(
            status
        );

    return (
        <span
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
        >
            {statusLabels[
                status
            ] ||
                status ||
                "Unknown"}
        </span>
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function ApplicantDetails() {
    const navigate =
        useNavigate();

    const { id } =
        useParams();


    // ========================================================
    // STATE
    // ========================================================

    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);

    const [
        recruiter,
        setRecruiter
    ] = useState(
        getCurrentUser()
    );

    const [
        company,
        setCompany
    ] = useState(null);

    const [
        application,
        setApplication
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
        status,
        setStatus
    ] = useState("");

    const [
        updatingStatus,
        setUpdatingStatus
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        actionError,
        setActionError
    ] = useState("");

    const [
        success,
        setSuccess
    ] = useState("");


    // ========================================================
    // LOAD APPLICATION
    // ========================================================

    const loadApplication =
        async ({
            showLoader = true
        } = {}) => {
            if (!id) {
                setError(
                    "Invalid application ID."
                );

                setLoading(false);
                return;
            }

            try {
                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");
                setActionError("");

                const [
                    applicationResult,
                    companyResult
                ] =
                    await Promise.allSettled(
                        [
                            getRecruiterApplicationById(
                                id
                            ),

                            getMyCompany()
                        ]
                    );


                if (
                    applicationResult.status ===
                    "rejected"
                ) {
                    throw applicationResult.reason;
                }


                const loadedApplication =
                    applicationResult
                        .value
                        ?.application;


                if (
                    !loadedApplication
                ) {
                    throw new Error(
                        "Application data was not returned by the server."
                    );
                }


                setApplication(
                    loadedApplication
                );

                setStatus(
                    loadedApplication.status ||
                    "APPLIED"
                );


                if (
                    companyResult.status ===
                    "fulfilled"
                ) {
                    setCompany(
                        companyResult
                            .value
                            ?.company ||
                        null
                    );
                }
            } catch (err) {
                console.error(
                    "Load applicant details error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load applicant details."
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
        loadApplication();
    }, [id]);


    // ========================================================
    // CURRENT RECRUITER
    // ========================================================

    useEffect(() => {
        const user =
            getCurrentUser();

        if (user) {
            setRecruiter(user);
        }
    }, []);


    // ========================================================
    // BASIC DATA
    // ========================================================

    const student =
        application?.student ||
        {};

    const job =
        application?.job ||
        {};

    const jobCompany =
        job?.company ||
        {};

    const recruiterName =
        recruiter?.name?.trim() ||
        "Recruiter";

    const recruiterInitials =
        getInitials(
            recruiterName
        );

    const companyName =
        company?.companyName ||
        jobCompany?.companyName ||
        "Your Company";

    const studentName =
        student?.name ||
        "Candidate";

    const studentInitials =
        getInitials(
            studentName
        );

    const currentStatus =
        application?.status ||
        status ||
        "APPLIED";


    // ========================================================
    // ELIGIBILITY
    // ========================================================

    const eligibility =
        useMemo(() => {
            if (!application) {
                return {
                    verified: false
                };
            }

            const minimumCGPA =
                Number(
                    job?.minimumCGPA
                );

            const studentCGPA =
                Number(
                    student?.cgpa
                );

            const departments =
                Array.isArray(
                    job?.allowedDepartments
                )
                    ? job.allowedDepartments
                    : [];


            const cgpaValid =
                !Number.isNaN(
                    minimumCGPA
                ) &&
                !Number.isNaN(
                    studentCGPA
                ) &&
                studentCGPA >=
                    minimumCGPA;


            const departmentValid =
                departments.length ===
                    0 ||
                departments.includes(
                    student?.department
                );


            const graduationValid =
                Number(
                    student?.graduationYear
                ) ===
                Number(
                    job?.graduationYear
                );


            return {
                verified:
                    cgpaValid &&
                    departmentValid &&
                    graduationValid
            };
        }, [
            application,
            job,
            student
        ]);


    // ========================================================
    // STATUS HISTORY
    // ========================================================

    const statusHistory =
        Array.isArray(
            application?.statusHistory
        )
            ? application.statusHistory
            : [];


    // ========================================================
    // FIND HISTORY ENTRY
    //
    // Backend now keeps one valid record per progress stage.
    // ========================================================

    const getHistoryEntry =
        (targetStatus) => {
            const entries =
                statusHistory.filter(
                    (entry) =>
                        entry?.status ===
                        targetStatus
                );

            if (
                entries.length === 0
            ) {
                return null;
            }

            return entries[
                entries.length - 1
            ];
        };


    // ========================================================
    // FIND REACHED PROGRESS INDEX
    // ========================================================

    const reachedProgressIndex =
        useMemo(() => {
            let highest =
                -1;

            statusHistory.forEach(
                (entry) => {
                    const index =
                        getStatusIndex(
                            entry?.status
                        );

                    if (
                        index >
                        highest
                    ) {
                        highest =
                            index;
                    }
                }
            );


            const currentIndex =
                getStatusIndex(
                    currentStatus
                );


            return Math.max(
                highest,
                currentIndex
            );
        }, [
            statusHistory,
            currentStatus
        ]);


    // ========================================================
    // APPLICATION TIMELINE
    //
    // Important behavior:
    //
    // 1. Future stages are NOT shown as completed.
    //
    // 2. If we jump from SHORTLISTED directly to SELECTED,
    //    INTERVIEW receives SELECTED's timestamp from backend.
    //
    // 3. If we go backwards, backend removes future stages,
    //    therefore this page automatically shows them as pending.
    // ========================================================

    const timeline =
        useMemo(() => {
            const items =
                PROGRESS_STATUSES.map(
                    (
                        stage,
                        index
                    ) => {
                        const historyEntry =
                            getHistoryEntry(
                                stage
                            );

                        const completed =
                            index <=
                            reachedProgressIndex;


                        let date =
                            historyEntry
                                ?.changedAt ||
                            null;


                        /*
                         * Fallback:
                         *
                         * If an old database record does not
                         * contain the skipped stage, find the
                         * first later completed stage.
                         *
                         * This makes old applications display
                         * correctly even before they are updated
                         * through the new backend logic.
                         */
                        if (
                            completed &&
                            !date
                        ) {
                            for (
                                let nextIndex =
                                    index +
                                    1;
                                nextIndex <=
                                    reachedProgressIndex;
                                nextIndex++
                            ) {
                                const laterEntry =
                                    getHistoryEntry(
                                        PROGRESS_STATUSES[
                                            nextIndex
                                        ]
                                    );

                                if (
                                    laterEntry
                                        ?.changedAt
                                ) {
                                    date =
                                        laterEntry.changedAt;

                                    break;
                                }
                            }
                        }


                        let description =
                            "";


                        switch (
                            stage
                        ) {
                            case "APPLIED":
                                description =
                                    "Candidate submitted an application for this position.";
                                break;

                            case "UNDER_REVIEW":
                                description =
                                    completed
                                        ? "Recruiter started reviewing the candidate application."
                                        : "Recruiter has not moved this application into review yet.";
                                break;

                            case "SHORTLISTED":
                                description =
                                    completed
                                        ? "Candidate was shortlisted for the next stage."
                                        : "Candidate has not been shortlisted yet.";
                                break;

                            case "INTERVIEW":
                                description =
                                    completed
                                        ? "Candidate has moved to the interview stage."
                                        : "Interview stage is pending.";
                                break;

                            case "SELECTED":
                                description =
                                    completed
                                        ? "Candidate has been selected for the position."
                                        : "Final selection has not been completed.";
                                break;

                            default:
                                description =
                                    "";
                        }


                        return {
                            key: stage,
                            title:
                                statusLabels[
                                    stage
                                ],
                            description,
                            date,
                            completed
                        };
                    }
                );


            // ------------------------------------------------
            // REJECTED
            // ------------------------------------------------

            if (
                currentStatus ===
                "REJECTED"
            ) {
                const rejectedEntry =
                    getHistoryEntry(
                        "REJECTED"
                    );

                items.push({
                    key:
                        "REJECTED",

                    title:
                        "Application Rejected",

                    description:
                        "The application was rejected by the recruiter.",

                    date:
                        rejectedEntry
                            ?.changedAt ||
                        application?.updatedAt ||
                        null,

                    completed:
                        true
                });
            }


            return items;
        }, [
            statusHistory,
            reachedProgressIndex,
            currentStatus,
            application
        ]);


    // ========================================================
    // PRIMARY ACTION
    // ========================================================

    const primaryAction =
        useMemo(() => {
            switch (
                currentStatus
            ) {
                case "APPLIED":
                    return {
                        status:
                            "UNDER_REVIEW",

                        label:
                            "Start Review"
                    };

                case "UNDER_REVIEW":
                    return {
                        status:
                            "SHORTLISTED",

                        label:
                            "Shortlist Candidate"
                    };

                case "SHORTLISTED":
                    return {
                        status:
                            "INTERVIEW",

                        label:
                            "Move to Interview"
                    };

                case "INTERVIEW":
                    return {
                        status:
                            "SELECTED",

                        label:
                            "Select Candidate"
                    };

                default:
                    return null;
            }
        }, [
            currentStatus
        ]);


    // ========================================================
    // UPDATE STATUS
    // ========================================================

    const handleStatusUpdate =
        async (
            nextStatus
        ) => {
            if (
                !application?._id ||
                !nextStatus
            ) {
                return;
            }


            if (
                nextStatus ===
                currentStatus
            ) {
                return;
            }


            try {
                setUpdatingStatus(
                    true
                );

                setActionError("");
                setSuccess("");


                await updateApplicationStatus(
                    application._id,
                    nextStatus
                );


                /*
                 * Fetch again so the UI receives the newly
                 * rebuilt statusHistory from MongoDB.
                 */
                const refreshed =
                    await getRecruiterApplicationById(
                        application._id
                    );


                const refreshedApplication =
                    refreshed?.application;


                if (
                    refreshedApplication
                ) {
                    setApplication(
                        refreshedApplication
                    );

                    setStatus(
                        refreshedApplication.status
                    );
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
                setUpdatingStatus(
                    false
                );
            }
        };


    // ========================================================
    // NAVIGATION
    // ========================================================

    const navigateTo =
        (path) => {
            setMobileMenuOpen(
                false
            );

            navigate(path);
        };


    const handleBack =
        () => {
            navigate(
                "/recruiter/applicants"
            );
        };


    const handleLogout =
        () => {
            logoutUser();

            navigate(
                "/login"
            );
        };


    const handleViewJob =
        () => {
            if (!job?._id) {
                return;
            }

            navigate(
                `/recruiter/jobs/${job._id}`
            );
        };


    const handleViewResume =
        () => {
            if (
                !student?.resumeLink
            ) {
                return;
            }

            window.open(
                student.resumeLink,
                "_blank",
                "noopener,noreferrer"
            );
        };


    // ========================================================
    // SIDEBAR
    // ========================================================

    const SidebarContent = ({
        mobile = false
    }) => (
        <div className="flex h-full flex-col">

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
                        onClick={() =>
                            setMobileMenuOpen(
                                false
                            )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

            </div>


            <nav className="flex-1 px-3 py-5">

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
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">

                <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
                    <SidebarContent />
                </aside>


                <main className="min-h-screen lg:ml-64">

                    <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

                        <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />

                    </header>


                    <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6 lg:px-8">

                        <div className="h-36 animate-pulse rounded-xl bg-white" />

                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

                            <div className="h-80 animate-pulse rounded-xl bg-white lg:col-span-2" />

                            <div className="h-80 animate-pulse rounded-xl bg-white" />

                        </div>

                    </div>

                </main>

            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (
        error ||
        !application
    ) {
        return (
            <div className="min-h-screen bg-slate-50">

                <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
                    <SidebarContent />
                </aside>


                <main className="min-h-screen lg:ml-64">

                    <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

                        <button
                            type="button"
                            onClick={
                                handleBack
                            }
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Applicants
                        </button>

                    </header>


                    <div className="mx-auto max-w-[700px] px-4 py-12 sm:px-6 lg:px-8">

                        <div className="rounded-xl border border-red-200 bg-white p-8 text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">

                                <AlertCircle className="h-6 w-6 text-red-600" />

                            </div>


                            <h2 className="mt-4 text-lg font-semibold text-slate-900">
                                Unable to load applicant
                            </h2>


                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {error ||
                                    "The requested application could not be found."}
                            </p>


                            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadApplication()
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleBack
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Applicants
                                </button>

                            </div>

                        </div>

                    </div>

                </main>

            </div>
        );
    }


    // ========================================================
    // MAIN PAGE
    // ========================================================

    const currentStatusStyle =
        getStatusStyle(
            currentStatus
        );


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
                        onClick={() =>
                            setMobileMenuOpen(
                                false
                            )
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
                        >
                            <Menu className="h-5 w-5" />
                        </button>


                        <button
                            type="button"
                            onClick={
                                handleBack
                            }
                            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />

                            <span className="hidden sm:inline">
                                Back to Applicants
                            </span>

                            <span className="sm:hidden">
                                Back
                            </span>
                        </button>


                        <div className="hidden h-5 w-px bg-slate-200 sm:block" />


                        <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                            Applicant Details
                        </h1>

                    </div>


                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">

                        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex">

                            <div className="flex h-7 w-7 items-center justify-center rounded bg-orange-100 text-xs font-bold text-orange-700">
                                {companyName
                                    ?.charAt(
                                        0
                                    )
                                    ?.toUpperCase() ||
                                    "C"}
                            </div>

                            <span className="max-w-[140px] truncate text-sm font-medium text-slate-700">
                                {companyName}
                            </span>

                        </div>


                        <div className="hidden h-6 w-px bg-slate-200 md:block" />


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

                <div className="mx-auto w-full max-w-[1250px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                    {/* ==================================================
                        CANDIDATE HEADER
                    ================================================== */}

                    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                            <div className="flex min-w-0 items-start gap-4">

                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700 sm:h-16 sm:w-16 sm:text-xl">
                                    {studentInitials}
                                </div>


                                <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-2.5">

                                        <h2 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">
                                            {studentName}
                                        </h2>


                                        <StatusBadge
                                            status={
                                                currentStatus
                                            }
                                        />

                                    </div>


                                    <p className="mt-1 text-sm text-slate-500">
                                        Applied for{" "}
                                        <span className="font-medium text-slate-700">
                                            {job?.title ||
                                                "Job Posting"}
                                        </span>
                                    </p>


                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">

                                        {student?.email && (
                                            <span className="flex items-center gap-1.5">

                                                <Mail className="h-3.5 w-3.5 shrink-0" />

                                                <span className="break-all">
                                                    {
                                                        student.email
                                                    }
                                                </span>

                                            </span>
                                        )}


                                        {student?.phone && (
                                            <span className="flex items-center gap-1.5">

                                                <Phone className="h-3.5 w-3.5 shrink-0" />

                                                {
                                                    student.phone
                                                }

                                            </span>
                                        )}


                                        {jobCompany?.location && (
                                            <span className="flex items-center gap-1.5">

                                                <MapPin className="h-3.5 w-3.5 shrink-0" />

                                                {
                                                    jobCompany.location
                                                }

                                            </span>
                                        )}

                                    </div>

                                </div>

                            </div>


                            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">

                                <button
                                    type="button"
                                    onClick={
                                        handleViewResume
                                    }
                                    disabled={
                                        !student?.resumeLink
                                    }
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Resume
                                </button>


                                {primaryAction && (
                                    <button
                                        type="button"
                                        disabled={
                                            updatingStatus
                                        }
                                        onClick={() =>
                                            handleStatusUpdate(
                                                primaryAction.status
                                            )
                                        }
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        <UserCheck className="h-4 w-4" />

                                        {updatingStatus
                                            ? "Updating..."
                                            : primaryAction.label}

                                    </button>
                                )}

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        MESSAGES
                    ================================================== */}

                    {(actionError ||
                        success) && (
                        <div className="mt-5">

                            {actionError && (
                                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">

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
                                    <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">

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
                        GRID
                    ================================================== */}

                    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">

                        {/* ==================================================
                            LEFT
                        ================================================== */}

                        <div className="space-y-5 lg:col-span-2 lg:space-y-6">

                            {/* ==================================================
                                ACADEMIC
                            ================================================== */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <div className="mb-5">

                                    <h3 className="font-semibold text-slate-900">
                                        Academic Information
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Candidate information used during eligibility validation.
                                    </p>

                                </div>


                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <div className="flex items-center gap-2 text-xs text-slate-500">

                                            <GraduationCap className="h-4 w-4" />

                                            Department

                                        </div>

                                        <p className="mt-2 text-sm font-semibold text-slate-900">
                                            {student?.department ||
                                                "—"}
                                        </p>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-xs text-slate-500">
                                            CGPA
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-slate-900">
                                            {student?.cgpa ??
                                                "—"}{" "}
                                            / 10
                                        </p>

                                    </div>


                                    <div className="rounded-lg border border-slate-200 p-4">

                                        <p className="text-xs text-slate-500">
                                            Graduation Year
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-slate-900">
                                            {student?.graduationYear ||
                                                "—"}
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={`mt-5 flex items-start gap-3 rounded-lg border px-4 py-3 ${
                                        eligibility.verified
                                            ? "border-emerald-200 bg-emerald-50"
                                            : "border-red-200 bg-red-50"
                                    }`}
                                >

                                    {eligibility.verified ? (
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    ) : (
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                    )}


                                    <div>

                                        <p
                                            className={`text-sm font-medium ${
                                                eligibility.verified
                                                    ? "text-emerald-800"
                                                    : "text-red-800"
                                            }`}
                                        >
                                            {eligibility.verified
                                                ? "Eligibility Verified"
                                                : "Eligibility Criteria Mismatch"}
                                        </p>


                                        <p
                                            className={`mt-0.5 text-xs leading-5 ${
                                                eligibility.verified
                                                    ? "text-emerald-700"
                                                    : "text-red-700"
                                            }`}
                                        >
                                            {eligibility.verified
                                                ? "The candidate passed the server-side CGPA, department, and graduation-year checks when applying."
                                                : "The candidate's current academic information does not satisfy all of the job's current eligibility requirements."}
                                        </p>

                                    </div>

                                </div>

                            </section>


                            {/* ==================================================
                                APPLICATION
                            ================================================== */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>

                                        <h3 className="font-semibold text-slate-900">
                                            Application
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Details of the candidate's submitted application.
                                        </p>

                                    </div>


                                    <StatusBadge
                                        status={
                                            currentStatus
                                        }
                                    />

                                </div>


                                <div className="space-y-5">

                                    <div>

                                        <p className="text-xs font-medium text-slate-500">
                                            Position
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {job?.title ||
                                                "Job Posting"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {jobCompany?.companyName ||
                                                companyName}
                                            {" · "}
                                            {job?.location ||
                                                jobCompany?.location ||
                                                "Location not specified"}
                                            {" · "}
                                            {job?.employmentType ===
                                            "FULL_TIME"
                                                ? "Full-time"
                                                : job?.employmentType ===
                                                  "INTERNSHIP"
                                                ? "Internship"
                                                : job?.employmentType ||
                                                  "—"}
                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-xs font-medium text-slate-500">
                                            Resume
                                        </p>


                                        <button
                                            type="button"
                                            onClick={
                                                handleViewResume
                                            }
                                            disabled={
                                                !student?.resumeLink
                                            }
                                            className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            <div className="flex min-w-0 items-center gap-3">

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">

                                                    <FileText className="h-4 w-4 text-red-600" />

                                                </div>


                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-medium text-slate-900">
                                                        {student?.resumeLink
                                                            ? "Candidate Resume"
                                                            : "No resume link provided"}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                                        {student?.resumeLink
                                                            ? "Open the resume submitted in the candidate profile."
                                                            : "The candidate has not added a resume link."}
                                                    </p>

                                                </div>

                                            </div>


                                            {student?.resumeLink && (
                                                <Download className="h-4 w-4 shrink-0 text-slate-400" />
                                            )}

                                        </button>

                                    </div>


                                    {Array.isArray(
                                        job?.skills
                                    ) &&
                                        job.skills.length >
                                            0 && (
                                            <div>

                                                <p className="text-xs font-medium text-slate-500">
                                                    Required Skills
                                                </p>


                                                <div className="mt-2 flex flex-wrap gap-2">

                                                    {job.skills.map(
                                                        (
                                                            skill
                                                        ) => (
                                                            <span
                                                                key={
                                                                    skill
                                                                }
                                                                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                                                            >
                                                                {
                                                                    skill
                                                                }
                                                            </span>
                                                        )
                                                    )}

                                                </div>

                                            </div>
                                        )}

                                </div>

                            </section>


                            {/* ==================================================
                                TIMELINE
                            ================================================== */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <div className="mb-6">

                                    <h3 className="font-semibold text-slate-900">
                                        Application Timeline
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Track the candidate's progress through the hiring process.
                                    </p>

                                </div>


                                <div className="relative">

                                    <div className="absolute left-[11px] top-3 h-[calc(100%-24px)] w-px bg-slate-200" />


                                    <div className="space-y-7">

                                        {timeline.map(
                                            (
                                                item
                                            ) => (
                                                <div
                                                    key={
                                                        item.key
                                                    }
                                                    className="relative flex gap-4"
                                                >

                                                    <div
                                                        className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                                            item.completed
                                                                ? "bg-emerald-100"
                                                                : "bg-slate-100"
                                                        }`}
                                                    >

                                                        {item.completed ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <Clock3 className="h-4 w-4 text-slate-400" />
                                                        )}

                                                    </div>


                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex flex-col justify-between gap-1 sm:flex-row">

                                                            <p
                                                                className={`text-sm font-medium ${
                                                                    item.completed
                                                                        ? "text-slate-900"
                                                                        : "text-slate-500"
                                                                }`}
                                                            >
                                                                {
                                                                    item.title
                                                                }
                                                            </p>


                                                            <span className="text-xs text-slate-400">
                                                                {item.completed
                                                                    ? formatDateTime(
                                                                          item.date
                                                                      )
                                                                    : "Pending"}
                                                            </span>

                                                        </div>


                                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                                            {
                                                                item.description
                                                            }
                                                        </p>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>

                            </section>

                        </div>


                        {/* ==================================================
                            RIGHT
                        ================================================== */}

                        <div className="space-y-5 lg:space-y-6">

                            {/* ==================================================
                                HIRING STATUS
                            ================================================== */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <h3 className="font-semibold text-slate-900">
                                    Hiring Status
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Current stage of this application.
                                </p>


                                <div
                                    className={`mt-5 rounded-lg border p-4 ${currentStatusStyle.panel}`}
                                >

                                    <p
                                        className={`text-xs font-medium uppercase ${currentStatusStyle.text}`}
                                    >
                                        Current Status
                                    </p>


                                    <p
                                        className={`mt-1 text-lg font-semibold ${currentStatusStyle.title}`}
                                    >
                                        {statusLabels[
                                            currentStatus
                                        ] ||
                                            currentStatus}
                                    </p>


                                    <p
                                        className={`mt-1 text-xs ${currentStatusStyle.text}`}
                                    >
                                        Updated{" "}
                                        {formatDate(
                                            application?.updatedAt
                                        )}
                                    </p>

                                </div>


                                <div className="mt-4">

                                    <label className="mb-2 block text-xs font-medium text-slate-600">
                                        Change Status
                                    </label>


                                    <select
                                        value={
                                            status
                                        }
                                        disabled={
                                            updatingStatus
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatus(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        {STATUS_OPTIONS.map(
                                            (
                                                option
                                            ) => (
                                                <option
                                                    key={
                                                        option
                                                    }
                                                    value={
                                                        option
                                                    }
                                                >
                                                    {
                                                        statusLabels[
                                                            option
                                                        ]
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>


                                    <button
                                        type="button"
                                        disabled={
                                            updatingStatus ||
                                            status ===
                                                currentStatus
                                        }
                                        onClick={() =>
                                            handleStatusUpdate(
                                                status
                                            )
                                        }
                                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <CheckCircle2 className="h-4 w-4" />

                                        {updatingStatus
                                            ? "Updating..."
                                            : "Update Status"}

                                    </button>

                                </div>

                            </section>


                            {/* ==================================================
                                APPLIED POSITION
                            ================================================== */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <h3 className="font-semibold text-slate-900">
                                    Applied Position
                                </h3>


                                <div className="mt-4">

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">

                                            <BriefcaseBusiness className="h-5 w-5 text-orange-600" />

                                        </div>


                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-slate-900">
                                                {job?.title ||
                                                    "Job Posting"}
                                            </p>


                                            <p className="mt-1 text-xs text-slate-500">
                                                {jobCompany?.companyName ||
                                                    companyName}
                                                {" · "}
                                                {job?.location ||
                                                    jobCompany?.location ||
                                                    "Location not specified"}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">

                                        <div className="flex items-start justify-between gap-4 text-xs">

                                            <span className="text-slate-500">
                                                Minimum CGPA
                                            </span>

                                            <span className="font-medium text-slate-800">
                                                {job?.minimumCGPA ??
                                                    "—"}
                                            </span>

                                        </div>


                                        <div className="flex items-start justify-between gap-4 text-xs">

                                            <span className="text-slate-500">
                                                Graduation Year
                                            </span>

                                            <span className="font-medium text-slate-800">
                                                {job?.graduationYear ||
                                                    "—"}
                                            </span>

                                        </div>


                                        <div className="flex items-start justify-between gap-4 text-xs">

                                            <span className="text-slate-500">
                                                Departments
                                            </span>

                                            <span className="max-w-[180px] text-right font-medium text-slate-800">
                                                {Array.isArray(
                                                    job?.allowedDepartments
                                                )
                                                    ? job.allowedDepartments.join(
                                                          ", "
                                                      )
                                                    : "—"}
                                            </span>

                                        </div>


                                        <div className="flex items-start justify-between gap-4 text-xs">

                                            <span className="text-slate-500">
                                                Employment Type
                                            </span>

                                            <span className="font-medium text-slate-800">
                                                {job?.employmentType ===
                                                "FULL_TIME"
                                                    ? "Full-time"
                                                    : job?.employmentType ===
                                                      "INTERNSHIP"
                                                    ? "Internship"
                                                    : job?.employmentType ||
                                                      "—"}
                                            </span>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            handleViewJob
                                        }
                                        disabled={
                                            !job?._id
                                        }
                                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        View Job Posting
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </button>

                                </div>

                            </section>


                            {/* ==================================================
                                APPLICATION INFORMATION
                            ================================================== */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <h3 className="font-semibold text-slate-900">
                                    Application Information
                                </h3>


                                <div className="mt-4 space-y-4">

                                    <div className="flex items-start justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Application ID
                                        </span>

                                        <span className="max-w-[190px] break-all text-right text-xs font-medium text-slate-800">
                                            {application?._id ||
                                                "—"}
                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Applied On
                                        </span>

                                        <span className="flex items-center gap-1.5 text-right text-xs font-medium text-slate-800">

                                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                                            {formatDate(
                                                application?.createdAt
                                            )}

                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Current Status
                                        </span>

                                        <StatusBadge
                                            status={
                                                currentStatus
                                            }
                                        />

                                    </div>


                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-xs text-slate-500">
                                            Eligibility
                                        </span>

                                        <span
                                            className={`flex items-center gap-1.5 text-xs font-medium ${
                                                eligibility.verified
                                                    ? "text-emerald-700"
                                                    : "text-red-700"
                                            }`}
                                        >

                                            {eligibility.verified ? (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            ) : (
                                                <AlertCircle className="h-3.5 w-3.5" />
                                            )}

                                            {eligibility.verified
                                                ? "Verified"
                                                : "Mismatch"}

                                        </span>

                                    </div>

                                </div>

                            </section>


                            {/* ==================================================
                                REFRESH
                            ================================================== */}

                            <button
                                type="button"
                                onClick={() =>
                                    loadApplication(
                                        {
                                            showLoader:
                                                false
                                        }
                                    )
                                }
                                disabled={
                                    refreshing
                                }
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                <RefreshCw
                                    className={`h-3.5 w-3.5 ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />

                                Refresh Applicant Data

                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}


export default ApplicantDetails;