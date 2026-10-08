import { useEffect, useMemo, useState } from "react";

import {
    LayoutDashboard,
    BriefcaseBusiness,
    FileText,
    UserRound,
    LogOut,
    Search,
    ChevronDown,
    GraduationCap,
    CheckCircle2,
    Clock3,
    Trophy,
    ArrowUpRight,
    MapPin,
    CalendarDays,
    MoreHorizontal,
    Menu,
    X
} from "lucide-react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

import {
    getProfile
} from "../../api/users.js";

import {
    getAvailableJobs
} from "../../api/jobs.js";

import {
    getMyApplications
} from "../../api/applications.js";


// ============================================================
// CONSTANTS
// ============================================================

const STATUS_LABELS = {
    APPLIED: "Applied",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview",
    SELECTED: "Selected",
    REJECTED: "Rejected"
};


const LOGO_STYLES = [
    "bg-orange-100 text-orange-600",
    "bg-blue-100 text-blue-600",
    "bg-sky-100 text-sky-600",
    "bg-emerald-100 text-emerald-600",
    "bg-violet-100 text-violet-600",
    "bg-indigo-100 text-indigo-600"
];


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


const getCompanyInitial = (name) => {
    return (
        name
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase() || "C"
    );
};


const getCompanyLogoStyle = (name) => {
    const character =
        name
            ?.trim()
            ?.charCodeAt(0) || 0;

    return LOGO_STYLES[
        character % LOGO_STYLES.length
    ];
};


const getStatusStyle = (status) => {
    switch (status) {
        case "SELECTED":
            return "bg-emerald-50 text-emerald-700";

        case "SHORTLISTED":
            return "bg-emerald-50 text-emerald-700";

        case "INTERVIEW":
            return "bg-violet-50 text-violet-700";

        case "UNDER_REVIEW":
            return "bg-blue-50 text-blue-700";

        case "REJECTED":
            return "bg-red-50 text-red-600";

        default:
            return "bg-slate-100 text-slate-600";
    }
};


// ============================================================
// ELIGIBILITY CALCULATION
// ============================================================

const isEligibleForJob = (
    job,
    profile
) => {
    if (!job || !profile) {
        return false;
    }

    if (
        profile.cgpa === null ||
        profile.cgpa === undefined ||
        !profile.department ||
        profile.graduationYear === null ||
        profile.graduationYear === undefined
    ) {
        return false;
    }

    const studentCgpa =
        Number(profile.cgpa);

    const minimumCgpa =
        Number(job.minimumCGPA);

    if (
        Number.isNaN(studentCgpa) ||
        Number.isNaN(minimumCgpa)
    ) {
        return false;
    }

    const allowedDepartments =
        Array.isArray(
            job.allowedDepartments
        )
            ? job.allowedDepartments.map(
                  (department) =>
                      String(department)
                          .trim()
                          .toLowerCase()
              )
            : [];

    const departmentEligible =
        allowedDepartments.includes(
            String(profile.department)
                .trim()
                .toLowerCase()
        );

    const graduationEligible =
        Number(profile.graduationYear) ===
        Number(job.graduationYear);

    return (
        studentCgpa >= minimumCgpa &&
        departmentEligible &&
        graduationEligible
    );
};


// ============================================================
// PROFILE COMPLETION
// Same 6 fields used in MyProfile.jsx
// ============================================================

const getProfileCompletion = (
    profile
) => {
    if (!profile) {
        return 0;
    }

    const fields = [
        profile.name,
        profile.phone,
        profile.department,
        profile.cgpa,
        profile.graduationYear,
        profile.resumeLink
    ];

    const completed =
        fields.filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                value !== ""
        ).length;

    return Math.round(
        (completed / fields.length) * 100
    );
};


// ============================================================
// COMPONENT
// ============================================================

function StudentDashboard() {

    const navigate = useNavigate();


    // ========================================================
    // STATE
    // ========================================================

    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    const [
        profile,
        setProfile
    ] = useState(null);


    const [
        applications,
        setApplications
    ] = useState([]);


    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    // ========================================================
    // LOAD DASHBOARD DATA
    // ========================================================

    useEffect(() => {

        let cancelled = false;


        const loadDashboard =
            async () => {

                try {

                    setLoading(true);
                    setError("");


                    const [
                        profileData,
                        applicationData,
                        jobData
                    ] = await Promise.all([

                        getProfile(),

                        getMyApplications(),

                        getAvailableJobs()

                    ]);


                    if (cancelled) {
                        return;
                    }


                    setProfile(
                        profileData?.user || null
                    );


                    setApplications(
                        Array.isArray(
                            applicationData?.applications
                        )
                            ? applicationData.applications
                            : []
                    );


                    setJobs(
                        Array.isArray(
                            jobData?.jobs
                        )
                            ? jobData.jobs
                            : []
                    );


                    // Keep localStorage user
                    // information up to date.
                    const storedUser =
                        getCurrentUser();


                    if (
                        storedUser &&
                        profileData?.user
                    ) {

                        localStorage.setItem(
                            "campushire_user",
                            JSON.stringify({
                                ...storedUser,
                                ...profileData.user
                            })
                        );

                    }

                } catch (err) {

                    if (cancelled) {
                        return;
                    }


                    console.error(
                        "Student dashboard error:",
                        err
                    );


                    setError(
                        err.message ||
                            "Unable to load your dashboard."
                    );

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


    // ========================================================
    // DERIVED DATA
    // ========================================================

    const eligibleJobs =
        useMemo(() => {

            return jobs.filter(
                (job) =>
                    isEligibleForJob(
                        job,
                        profile
                    )
            );

        }, [jobs, profile]);


    const appliedJobIds =
        useMemo(() => {

            return new Set(
                applications
                    .map(
                        (application) =>
                            application?.job?._id
                    )
                    .filter(Boolean)
                    .map((id) =>
                        String(id)
                    )
            );

        }, [applications]);


    /*
     * Show the best eligible opportunities.
     * We intentionally keep already-applied jobs
     * visible and mark them as "Applied", so the
     * dashboard still shows useful real data.
     */
    const recommendedJobs =
        useMemo(() => {

            return eligibleJobs.slice(
                0,
                3
            );

        }, [eligibleJobs]);


    const newEligibleJobsThisWeek =
        useMemo(() => {

            const now =
                Date.now();

            const sevenDays =
                7 *
                24 *
                60 *
                60 *
                1000;


            return eligibleJobs.filter(
                (job) => {

                    if (!job?.createdAt) {
                        return false;
                    }


                    const createdAt =
                        new Date(
                            job.createdAt
                        ).getTime();


                    if (
                        Number.isNaN(
                            createdAt
                        )
                    ) {
                        return false;
                    }


                    const difference =
                        now -
                        createdAt;


                    return (
                        difference >= 0 &&
                        difference <=
                            sevenDays
                    );

                }
            ).length;

        }, [eligibleJobs]);


    const underReviewCount =
        applications.filter(
            (application) =>
                application?.status ===
                "UNDER_REVIEW"
        ).length;


    const shortlistedCount =
        applications.filter(
            (application) =>
                application?.status ===
                "SHORTLISTED"
        ).length;


    const offerCount =
        applications.filter(
            (application) =>
                application?.status ===
                "SELECTED"
        ).length;


    const profileCompletion =
        getProfileCompletion(
            profile
        );


    const personalDetailsComplete =
        Boolean(
            profile?.name &&
            profile?.phone
        );


    const academicDetailsComplete =
        Boolean(
            profile?.department &&
            profile?.cgpa !== null &&
            profile?.cgpa !== undefined &&
            profile?.graduationYear
        );


    const resumeComplete =
        Boolean(
            profile?.resumeLink
        );


    const recentApplications =
        applications.slice(0, 4);


    const welcomeName =
        profile?.name
            ?.trim()
            ?.split(" ")[0] ||
        "Student";


    // ========================================================
    // MOBILE MENU
    // ========================================================

    const closeMobileMenu =
        () => {
            setMobileMenuOpen(false);
        };


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout =
        () => {

            logoutUser();

            navigate("/login");

        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading your dashboard...
                    </p>

                </div>

            </div>
        );

    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

                <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm">

                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <X className="h-5 w-5" />
                    </div>


                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        Unable to load dashboard
                    </h2>


                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Try again
                    </button>

                </div>

            </div>
        );

    }


    // ========================================================
    // MAIN UI
    // ========================================================

    return (

        <div className="flex min-h-screen overflow-x-hidden bg-slate-50">


            {/* ==================================================
                MOBILE OVERLAY
            ================================================== */}

            {mobileMenuOpen && (

                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={
                        closeMobileMenu
                    }
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                />

            )}


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`fixed bottom-0 left-0 top-0 z-40 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
                    mobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                } lg:translate-x-0`}
            >


                {/* ------------------------------------------
                    LOGO
                ------------------------------------------ */}

                <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-100 px-5 sm:px-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">

                            <GraduationCap className="h-5 w-5 text-white" />

                        </div>


                        <div>

                            <h1 className="text-lg font-bold text-slate-900">
                                CampusHire
                            </h1>

                            <p className="text-[11px] text-slate-400">
                                Student Portal
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={
                            closeMobileMenu
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                        aria-label="Close navigation"
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>


                {/* ------------------------------------------
                    NAVIGATION
                ------------------------------------------ */}

                <nav className="flex-1 overflow-y-auto px-4 py-6">

                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Workspace
                    </p>


                    <div className="space-y-1">


                        {/* OVERVIEW */}

                        <Link
                            to="/student/dashboard"
                            onClick={
                                closeMobileMenu
                            }
                            className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
                        >

                            <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />

                            Overview

                        </Link>


                        {/* BROWSE JOBS */}

                        <Link
                            to="/student/jobs"
                            onClick={
                                closeMobileMenu
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >

                            <BriefcaseBusiness className="h-[18px] w-[18px] shrink-0" />

                            Browse Jobs

                        </Link>


                        {/* APPLICATIONS */}

                        <Link
                            to="/student/applications"
                            onClick={
                                closeMobileMenu
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >

                            <FileText className="h-[18px] w-[18px] shrink-0" />

                            My Applications

                        </Link>


                        {/* PROFILE */}

                        <Link
                            to="/student/profile"
                            onClick={
                                closeMobileMenu
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >

                            <UserRound className="h-[18px] w-[18px] shrink-0" />

                            My Profile

                        </Link>

                    </div>


                    {/* ACCOUNT */}

                    <div className="mt-10">

                        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Account
                        </p>


                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                        >

                            <LogOut className="h-[18px] w-[18px] shrink-0" />

                            Sign out

                        </button>

                    </div>

                </nav>


                {/* ------------------------------------------
                    MINI PROFILE
                ------------------------------------------ */}

                <div className="shrink-0 border-t border-slate-100 p-4">

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">

                            {getCompanyInitial(
                                profile?.name
                            )}

                        </div>


                        <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-slate-800">
                                {profile?.name ||
                                    "Student"}
                            </p>


                            <p className="truncate text-[11px] text-slate-500">

                                {profile?.department ||
                                    "Department not set"}

                                {profile?.cgpa !== null &&
                                profile?.cgpa !== undefined
                                    ? ` · ${profile.cgpa} CGPA`
                                    : ""}

                            </p>

                        </div>

                    </div>

                </div>

            </aside>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="min-h-screen min-w-0 flex-1 lg:ml-[250px]">


                {/* ==================================================
                    TOP BAR
                ================================================== */}

                <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">


                    {/* LEFT */}

                    <div className="flex min-w-0 items-center gap-3">


                        {/* MOBILE MENU */}

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


                        {/* MOBILE LOGO */}

                        <div className="flex min-w-0 items-center gap-2 lg:hidden">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">

                                <GraduationCap className="h-5 w-5 text-white" />

                            </div>


                            <span className="truncate font-bold text-slate-900">
                                CampusHire
                            </span>

                        </div>


                        {/* SEARCH */}

                        <div className="relative hidden w-[300px] md:flex">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                placeholder="Search jobs, companies..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white"
                            />

                        </div>

                    </div>


                    {/* USER */}

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-slate-800">
                                {profile?.name ||
                                    "Student"}
                            </p>

                            <p className="text-[11px] text-slate-500">
                                Student
                            </p>

                        </div>


                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">

                            {getCompanyInitial(
                                profile?.name
                            )}

                        </div>


                        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />

                    </div>

                </header>


                {/* ==================================================
                    DASHBOARD CONTENT
                ================================================== */}

                <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">


                    {/* ==================================================
                        HEADING
                    ================================================== */}

                    <div className="mb-7 sm:mb-8">

                        <p className="mb-1 text-sm font-medium text-blue-600">
                            Student Dashboard
                        </p>


                        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">

                            Welcome back,{" "}
                            {welcomeName} 👋

                        </h2>


                        <p className="mt-2 text-sm text-slate-500">
                            Here's an overview of your placement journey.
                        </p>

                    </div>


                    {/* ==================================================
                        STAT CARDS
                    ================================================== */}

                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">


                        {/* ELIGIBLE JOBS */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5">

                            <div className="flex items-start justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="text-sm text-slate-500">
                                        Eligible Jobs
                                    </p>


                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {eligibleJobs.length}
                                    </p>

                                </div>


                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">

                                    <BriefcaseBusiness className="h-5 w-5 text-blue-600" />

                                </div>

                            </div>


                            <p className="mt-4 text-xs text-emerald-600">

                                {academicDetailsComplete
                                    ? `${newEligibleJobsThisWeek} new this week`
                                    : "Complete your academic profile to calculate eligibility"}

                            </p>

                        </div>


                        {/* APPLICATIONS */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5">

                            <div className="flex items-start justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="text-sm text-slate-500">
                                        Applications
                                    </p>


                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {applications.length}
                                    </p>

                                </div>


                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">

                                    <FileText className="h-5 w-5 text-violet-600" />

                                </div>

                            </div>


                            <p className="mt-4 text-xs text-slate-500">

                                {underReviewCount === 1
                                    ? "1 currently under review"
                                    : `${underReviewCount} currently under review`}

                            </p>

                        </div>


                        {/* SHORTLISTED */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5">

                            <div className="flex items-start justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="text-sm text-slate-500">
                                        Shortlisted
                                    </p>


                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {shortlistedCount}
                                    </p>

                                </div>


                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">

                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                                </div>

                            </div>


                            <p className="mt-4 text-xs text-emerald-600">

                                {shortlistedCount > 0
                                    ? "Keep up the momentum"
                                    : "No shortlisted applications yet"}

                            </p>

                        </div>


                        {/* OFFERS */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5">

                            <div className="flex items-start justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="text-sm text-slate-500">
                                        Offers
                                    </p>


                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {offerCount}
                                    </p>

                                </div>


                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">

                                    <Trophy className="h-5 w-5 text-amber-600" />

                                </div>

                            </div>


                            <p className="mt-4 text-xs text-slate-500">

                                {offerCount > 0
                                    ? "Congratulations!"
                                    : "No offers yet"}

                            </p>

                        </div>

                    </div>


                    {/* ==================================================
                        PROFILE + QUICK ACTION
                    ================================================== */}

                    <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">


                        {/* PROFILE COMPLETION */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">

                            <div className="mb-5 flex items-start justify-between gap-4">

                                <div className="min-w-0">

                                    <h3 className="font-semibold text-slate-900">
                                        Complete your profile
                                    </h3>


                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        A complete profile improves your chances of getting noticed.
                                    </p>

                                </div>


                                <span className="shrink-0 text-sm font-bold text-blue-600">
                                    {profileCompletion}%
                                </span>

                            </div>


                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">

                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all"
                                    style={{
                                        width: `${profileCompletion}%`
                                    }}
                                />

                            </div>


                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">


                                <div className="flex flex-wrap gap-2">

                                    <span
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                            personalDetailsComplete
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                        }`}
                                    >
                                        Personal details
                                    </span>


                                    <span
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                            academicDetailsComplete
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                        }`}
                                    >
                                        Academic details
                                    </span>


                                    <span
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                            resumeComplete
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                        }`}
                                    >
                                        Resume
                                    </span>

                                </div>


                                <Link
                                    to="/student/profile"
                                    className="flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-blue-600 hover:text-blue-700 sm:self-auto"
                                >

                                    {profileCompletion === 100
                                        ? "View profile"
                                        : "Complete profile"}

                                    <ArrowUpRight className="h-4 w-4" />

                                </Link>

                            </div>

                        </div>


                        {/* QUICK ACTION */}

                        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white sm:p-6">

                            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">

                                <Search className="h-5 w-5 text-white" />

                            </div>


                            <h3 className="text-lg font-semibold">
                                Find your next opportunity
                            </h3>


                            <p className="mt-2 text-sm leading-6 text-blue-100">
                                Explore approved openings that match your academic profile.
                            </p>


                            <Link
                                to="/student/jobs"
                                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:w-auto"
                            >
                                Browse eligible jobs
                            </Link>

                        </div>

                    </div>


                    {/* ==================================================
                        RECENT APPLICATIONS
                    ================================================== */}

                    <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white">


                        {/* HEADER */}

                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

                            <div className="min-w-0">

                                <h3 className="font-semibold text-slate-900">
                                    Recent Applications
                                </h3>


                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    Track the progress of your recent applications.
                                </p>

                            </div>


                            <Link
                                to="/student/applications"
                                className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                View all
                            </Link>

                        </div>


                        {/* DESKTOP */}

                        <div className="hidden overflow-x-auto md:block">

                            <table className="w-full">

                                <thead>

                                    <tr className="bg-slate-50/70">

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Company
                                        </th>


                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Position
                                        </th>


                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Applied on
                                        </th>


                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>


                                        <th className="w-10"></th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {recentApplications.length > 0 ? (

                                        recentApplications.map(
                                            (application) => {

                                                const company =
                                                    application
                                                        ?.job
                                                        ?.company
                                                        ?.companyName ||
                                                    "Company";


                                                return (

                                                    <tr
                                                        key={application._id}
                                                        className="border-t border-slate-100 transition hover:bg-slate-50/50"
                                                    >


                                                        {/* COMPANY */}

                                                        <td className="px-6 py-4">

                                                            <div className="flex items-center gap-3">

                                                                <div
                                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getCompanyLogoStyle(
                                                                        company
                                                                    )}`}
                                                                >
                                                                    {getCompanyInitial(
                                                                        company
                                                                    )}
                                                                </div>


                                                                <span className="text-sm font-semibold text-slate-800">
                                                                    {company}
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* POSITION */}

                                                        <td className="px-6 py-4">

                                                            <span className="text-sm text-slate-600">

                                                                {application
                                                                    ?.job
                                                                    ?.title ||
                                                                    "Position unavailable"}

                                                            </span>

                                                        </td>


                                                        {/* DATE */}

                                                        <td className="px-6 py-4">

                                                            <span className="text-sm text-slate-500">

                                                                {formatDate(
                                                                    application.createdAt
                                                                )}

                                                            </span>

                                                        </td>


                                                        {/* STATUS */}

                                                        <td className="px-6 py-4">

                                                            <span
                                                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                                                    application.status
                                                                )}`}
                                                            >

                                                                {application.status ===
                                                                    "SHORTLISTED" && (
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                )}


                                                                {application.status ===
                                                                    "UNDER_REVIEW" && (
                                                                    <Clock3 className="h-3 w-3" />
                                                                )}


                                                                {STATUS_LABELS[
                                                                    application.status
                                                                ] ||
                                                                    application.status ||
                                                                    "Unknown"}

                                                            </span>

                                                        </td>


                                                        {/* ACTION */}

                                                        <td className="px-6 py-4">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        "/student/applications"
                                                                    )
                                                                }
                                                                className="rounded-md p-1.5 hover:bg-slate-100"
                                                                aria-label={`View ${company} application`}
                                                            >

                                                                <MoreHorizontal className="h-4 w-4 text-slate-400" />

                                                            </button>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="px-6 py-10 text-center text-sm text-slate-500"
                                            >
                                                You have not submitted any applications yet.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* MOBILE */}

                        <div className="divide-y divide-slate-100 md:hidden">

                            {recentApplications.length > 0 ? (

                                recentApplications.map(
                                    (application) => {

                                        const company =
                                            application
                                                ?.job
                                                ?.company
                                                ?.companyName ||
                                            "Company";


                                        return (

                                            <button
                                                type="button"
                                                key={application._id}
                                                onClick={() =>
                                                    navigate(
                                                        "/student/applications"
                                                    )
                                                }
                                                className="block w-full p-4 text-left transition hover:bg-slate-50 sm:p-5"
                                            >

                                                <div className="flex items-start gap-3">


                                                    <div className="flex min-w-0 flex-1 items-center gap-3">

                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getCompanyLogoStyle(
                                                                company
                                                            )}`}
                                                        >

                                                            {getCompanyInitial(
                                                                company
                                                            )}

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                                {company}
                                                            </p>


                                                            <p className="mt-0.5 break-words text-xs text-slate-500">

                                                                {application
                                                                    ?.job
                                                                    ?.title ||
                                                                    "Position unavailable"}

                                                            </p>

                                                        </div>

                                                    </div>


                                                    <span
                                                        className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                                            application.status
                                                        )}`}
                                                    >

                                                        {STATUS_LABELS[
                                                            application.status
                                                        ] ||
                                                            application.status ||
                                                            "Unknown"}

                                                    </span>

                                                </div>


                                                <p className="mt-3 text-xs text-slate-400">

                                                    Applied{" "}

                                                    {formatDate(
                                                        application.createdAt
                                                    )}

                                                </p>

                                            </button>

                                        );

                                    }
                                )

                            ) : (

                                <div className="p-8 text-center text-sm text-slate-500">
                                    You have not submitted any applications yet.
                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        RECOMMENDED OPPORTUNITIES
                    ================================================== */}

                    <div>


                        {/* HEADER */}

                        <div className="mb-5 flex items-end justify-between gap-4">

                            <div className="min-w-0">

                                <h3 className="font-semibold text-slate-900">
                                    Recommended Opportunities
                                </h3>


                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    Approved openings matching your eligibility.
                                </p>

                            </div>


                            <Link
                                to="/student/jobs"
                                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 sm:flex"
                            >

                                Browse all

                                <ArrowUpRight className="h-4 w-4" />

                            </Link>

                        </div>


                        {/* JOB CARDS */}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {recommendedJobs.length > 0 ? (

                                recommendedJobs.map(
                                    (job) => {

                                        const companyName =
                                            job
                                                ?.company
                                                ?.companyName ||
                                            "Company";


                                        const alreadyApplied =
                                            appliedJobIds.has(
                                                String(
                                                    job._id
                                                )
                                            );


                                        return (

                                            <div
                                                key={job._id}
                                                className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
                                            >


                                                {/* COMPANY */}

                                                <div className="flex items-start gap-3">

                                                    <div className="flex min-w-0 flex-1 items-center gap-3">

                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${getCompanyLogoStyle(
                                                                companyName
                                                            )}`}
                                                        >

                                                            {getCompanyInitial(
                                                                companyName
                                                            )}

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                                {companyName}
                                                            </p>


                                                            <p className="mt-0.5 text-xs text-slate-500">
                                                                Verified opening
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                            alreadyApplied
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-emerald-50 text-emerald-700"
                                                        }`}
                                                    >

                                                        {alreadyApplied
                                                            ? "Applied"
                                                            : "Eligible"}

                                                    </span>

                                                </div>


                                                {/* ROLE */}

                                                <h4 className="mt-5 break-words font-semibold text-slate-900">
                                                    {job.title}
                                                </h4>


                                                {/* DETAILS */}

                                                <div className="mt-4 space-y-2">


                                                    <div className="flex items-center gap-2 text-xs text-slate-500">

                                                        <MapPin className="h-3.5 w-3.5 shrink-0" />

                                                        <span>
                                                            {job.location ||
                                                                "Location not specified"}
                                                        </span>

                                                    </div>


                                                    <div className="flex items-center gap-2 text-xs text-slate-500">

                                                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />

                                                        <span>
                                                            Minimum{" "}
                                                            {job.minimumCGPA}
                                                            + CGPA
                                                        </span>

                                                    </div>


                                                    <div className="flex items-center gap-2 text-xs text-slate-500">

                                                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                                                        <span>

                                                            {job.employmentType ===
                                                            "INTERNSHIP"
                                                                ? "Internship"
                                                                : "Full-time"}

                                                            {" · "}

                                                            Graduation{" "}
                                                            {job.graduationYear}

                                                        </span>

                                                    </div>

                                                </div>


                                                {/* ACTION */}

                                                <Link
                                                    to={`/student/jobs/${job._id}`}
                                                    className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    View opportunity
                                                </Link>

                                            </div>

                                        );

                                    }
                                )

                            ) : (

                                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center md:col-span-2 xl:col-span-3">

                                    <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" />


                                    <h4 className="mt-3 text-sm font-semibold text-slate-800">

                                        {academicDetailsComplete
                                            ? "No eligible opportunities right now"
                                            : "Complete your academic profile"}

                                    </h4>


                                    <p className="mt-1 text-sm text-slate-500">

                                        {academicDetailsComplete
                                            ? "There are no active openings currently matching your CGPA, department and graduation year."
                                            : "Update your CGPA, department and graduation year to calculate job eligibility."}

                                    </p>


                                    <Link
                                        to={
                                            academicDetailsComplete
                                                ? "/student/jobs"
                                                : "/student/profile"
                                        }
                                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >

                                        {academicDetailsComplete
                                            ? "Browse jobs"
                                            : "Complete profile"}

                                        <ArrowUpRight className="h-4 w-4" />

                                    </Link>

                                </div>

                            )}

                        </div>


                        {/* MOBILE BROWSE ALL */}

                        <Link
                            to="/student/jobs"
                            className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 sm:hidden"
                        >

                            Browse all opportunities

                            <ArrowUpRight className="h-4 w-4" />

                        </Link>

                    </div>

                </div>

            </main>

        </div>
    );
}


export default StudentDashboard;