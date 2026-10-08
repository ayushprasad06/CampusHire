import React, { useEffect, useMemo, useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    LayoutDashboard,
    BriefcaseBusiness,
    FileText,
    UserRound,
    LogOut,
    Search,
    ChevronDown,
    GraduationCap,
    MapPin,
    CalendarDays,
    Clock3,
    CheckCircle2,
    XCircle,
    SlidersHorizontal,
    ArrowUpRight,
    ChevronRight,
    Menu,
    X
} from "lucide-react";

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
// HELPERS
// ============================================================

const formatEmploymentType = (type) => {
    if (type === "INTERNSHIP") return "Internship";
    if (type === "FULL_TIME") return "Full Time";
    return type || "Not specified";
};

const formatDeadline = (deadline) => {
    if (!deadline) {
        return "Deadline not set";
    }

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
        return "Deadline unavailable";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const formatPostedDate = (createdAt) => {
    if (!createdAt) return "Recently";

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    const now = new Date();
    const difference = now.getTime() - date.getTime();
    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    if (days <= 0) return "today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 14) return "1 week ago";

    const weeks = Math.floor(days / 7);
    return `${weeks} weeks ago`;
};

const getInitial = (value) => {
    return (
        value?.trim()?.charAt(0)?.toUpperCase() ||
        "C"
    );
};

const getLogoStyle = (value) => {
    const styles = [
        "bg-orange-100 text-orange-600",
        "bg-blue-100 text-blue-600",
        "bg-emerald-100 text-emerald-700",
        "bg-violet-100 text-violet-600",
        "bg-indigo-100 text-indigo-600",
        "bg-sky-100 text-sky-600"
    ];

    const code = value?.charCodeAt(0) || 0;
    return styles[code % styles.length];
};

const isSameText = (left, right) => {
    return (
        String(left || "")
            .trim()
            .toLowerCase() ===
        String(right || "")
            .trim()
            .toLowerCase()
    );
};


// ============================================================
// ELIGIBILITY
// ============================================================

const getEligibility = (job, profile) => {
    const reasons = [];

    if (!profile) {
        return {
            eligible: false,
            reason:
                "Your student profile could not be loaded. Please try again."
        };
    }

    if (
        profile.cgpa === null ||
        profile.cgpa === undefined ||
        profile.cgpa === ""
    ) {
        reasons.push("your CGPA is not updated");
    } else if (
        Number(profile.cgpa) <
        Number(job.minimumCGPA)
    ) {
        reasons.push(
            `minimum CGPA is ${Number(job.minimumCGPA).toFixed(2)}, but your CGPA is ${Number(profile.cgpa).toFixed(2)}`
        );
    }

    if (!profile.department) {
        reasons.push("your department is not updated");
    } else if (
        !Array.isArray(job.allowedDepartments) ||
        !job.allowedDepartments.some((department) =>
            isSameText(
                department,
                profile.department
            )
        )
    ) {
        const departments = Array.isArray(
            job.allowedDepartments
        )
            ? job.allowedDepartments.join(", ")
            : "the specified departments";

        reasons.push(
            `your department (${profile.department}) is not among ${departments}`
        );
    }

    if (
        profile.graduationYear === null ||
        profile.graduationYear === undefined ||
        profile.graduationYear === ""
    ) {
        reasons.push(
            "your graduation year is not updated"
        );
    } else if (
        Number(profile.graduationYear) !==
        Number(job.graduationYear)
    ) {
        reasons.push(
            `this posting is for graduation year ${job.graduationYear}`
        );
    }

    if (reasons.length === 0) {
        return {
            eligible: true,
            reason: "You meet the current eligibility criteria."
        };
    }

    return {
        eligible: false,
        reason: `You cannot apply because ${reasons.join("; ")}.`
    };
};


// ============================================================
// COMPONENT
// ============================================================

function BrowseJobs() {
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [profile, setProfile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] =
        useState([]);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [departmentFilter, setDepartmentFilter] =
        useState("ALL");

    const [locationFilter, setLocationFilter] =
        useState("ALL");

    const [eligibilityFilter, setEligibilityFilter] =
        useState("ALL");

    const [sortOrder, setSortOrder] =
        useState("RECENT");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ========================================================
    // LOAD DATA
    // ========================================================

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    profileData,
                    jobData,
                    applicationData
                ] = await Promise.all([
                    getProfile(),
                    getAvailableJobs(),
                    getMyApplications()
                ]);

                if (cancelled) return;

                setProfile(
                    profileData?.user || null
                );

                setJobs(
                    Array.isArray(jobData?.jobs)
                        ? jobData.jobs
                        : []
                );

                setApplications(
                    Array.isArray(
                        applicationData?.applications
                    )
                        ? applicationData.applications
                        : []
                );

                // Keep the latest profile information
                // available to the rest of the student UI.
                const storedUser = getCurrentUser();

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
                if (cancelled) return;

                console.error(
                    "Browse jobs error:",
                    err
                );

                setError(
                    err.message ||
                        "Unable to load available jobs."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, []);


    // ========================================================
    // DERIVED FILTER OPTIONS
    // ========================================================

    const departmentOptions = useMemo(() => {
        const departments = new Set();

        jobs.forEach((job) => {
            if (!Array.isArray(job.allowedDepartments)) {
                return;
            }

            job.allowedDepartments.forEach(
                (department) => {
                    if (department) {
                        departments.add(
                            String(department).trim()
                        );
                    }
                }
            );
        });

        return Array.from(departments).sort(
            (a, b) => a.localeCompare(b)
        );
    }, [jobs]);


    const locationOptions = useMemo(() => {
        const locations = new Set();

        jobs.forEach((job) => {
            if (job.location) {
                locations.add(
                    String(job.location).trim()
                );
            }
        });

        return Array.from(locations).sort(
            (a, b) => a.localeCompare(b)
        );
    }, [jobs]);


    // ========================================================
    // APPLICATION LOOKUP
    // ========================================================

    const appliedJobIds = useMemo(() => {
        return new Set(
            applications
                .map(
                    (application) =>
                        application?.job?._id
                )
                .filter(Boolean)
                .map((id) => String(id))
        );
    }, [applications]);


    // ========================================================
    // FILTERED / SORTED JOBS
    // ========================================================

    const displayedJobs = useMemo(() => {
        const normalizedSearch =
            searchTerm.trim().toLowerCase();

        const filtered = jobs.filter((job) => {
            const companyName =
                job?.company?.companyName || "";

            const title = job?.title || "";

            const matchesSearch =
                !normalizedSearch ||
                title
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                companyName
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesDepartment =
                departmentFilter === "ALL" ||
                (Array.isArray(
                    job.allowedDepartments
                ) &&
                    job.allowedDepartments.some(
                        (department) =>
                            isSameText(
                                department,
                                departmentFilter
                            )
                    ));

            const matchesLocation =
                locationFilter === "ALL" ||
                isSameText(
                    job.location,
                    locationFilter
                );

            const eligibility = getEligibility(
                job,
                profile
            );

            const matchesEligibility =
                eligibilityFilter === "ALL" ||
                (eligibilityFilter === "ELIGIBLE"
                    ? eligibility.eligible
                    : !eligibility.eligible);

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesLocation &&
                matchesEligibility
            );
        });

        return [...filtered].sort((a, b) => {
            if (sortOrder === "CGPA_LOW") {
                return (
                    Number(a.minimumCGPA) -
                    Number(b.minimumCGPA)
                );
            }

            if (sortOrder === "CGPA_HIGH") {
                return (
                    Number(b.minimumCGPA) -
                    Number(a.minimumCGPA)
                );
            }

            if (sortOrder === "TITLE") {
                return String(a.title || "").localeCompare(
                    String(b.title || "")
                );
            }

            return (
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            );
        });
    }, [
        jobs,
        profile,
        searchTerm,
        departmentFilter,
        locationFilter,
        eligibilityFilter,
        sortOrder
    ]);


    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };


    const clearFilters = () => {
        setSearchTerm("");
        setDepartmentFilter("ALL");
        setLocationFilter("ALL");
        setEligibilityFilter("ALL");
        setSortOrder("RECENT");
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
                        Loading available jobs...
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
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                        <XCircle className="h-5 w-5 text-red-600" />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        Unable to load jobs
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
    // MAIN
    // ========================================================

    const profileInitial = getInitial(
        profile?.name
    );

    return (
        <div className="flex min-h-screen overflow-x-hidden bg-slate-50">

            {/* ==================================================
                MOBILE OVERLAY
            ================================================== */}

            {mobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={closeMobileMenu}
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

                {/* Logo */}
                <div className="flex h-[76px] shrink-0 items-center justify-start border-b border-slate-100 px-5 sm:px-6">
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
                        onClick={closeMobileMenu}
                        className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                        aria-label="Close navigation"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>


                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Workspace
                    </p>

                    <div className="space-y-1">
                        <Link
                            to="/student/dashboard"
                            onClick={closeMobileMenu}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
                            Overview
                        </Link>

                        <Link
                            to="/student/jobs"
                            onClick={closeMobileMenu}
                            className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
                        >
                            <BriefcaseBusiness className="h-[18px] w-[18px] shrink-0" />
                            Browse Jobs
                        </Link>

                        <Link
                            to="/student/applications"
                            onClick={closeMobileMenu}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            <FileText className="h-[18px] w-[18px] shrink-0" />
                            My Applications
                        </Link>

                        <Link
                            to="/student/profile"
                            onClick={closeMobileMenu}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            <UserRound className="h-[18px] w-[18px] shrink-0" />
                            My Profile
                        </Link>
                    </div>

                    <div className="mt-10">
                        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Account
                        </p>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                        >
                            <LogOut className="h-[18px] w-[18px] shrink-0" />
                            Sign out
                        </button>
                    </div>
                </nav>


                {/* Student */}
                <div className="shrink-0 border-t border-slate-100 p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {profileInitial}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                                {profile?.name || "Student"}
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                                {profile?.department ||
                                    "Department not set"}
                                {profile?.cgpa !== null &&
                                profile?.cgpa !== undefined &&
                                profile?.cgpa !== ""
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

                {/* TOP BAR */}
                <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(true)
                            }
                            className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="flex min-w-0 items-center gap-2 lg:hidden">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>

                            <span className="truncate font-bold text-slate-900">
                                CampusHire
                            </span>
                        </div>

                        <div className="relative hidden w-[300px] md:flex">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Search jobs, companies..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold text-slate-800">
                                {profile?.name || "Student"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Student
                            </p>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {profileInitial}
                        </div>

                        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                    </div>
                </header>


                {/* PAGE CONTENT */}
                <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

                    {/* HEADING */}
                    <div className="mb-7">
                        <p className="mb-1 text-sm font-medium text-blue-600">
                            Opportunities
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            Browse Jobs
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Explore approved opportunities available for your profile.
                        </p>
                    </div>


                    {/* ELIGIBILITY SUMMARY */}
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Your eligibility profile
                                    </p>

                                    <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1">
                                        <span className="text-xs text-slate-500">
                                            Department:{" "}
                                            <span className="font-semibold text-slate-700">
                                                {profile?.department ||
                                                    "Not set"}
                                            </span>
                                        </span>

                                        <span className="text-xs text-slate-500">
                                            CGPA:{" "}
                                            <span className="font-semibold text-slate-700">
                                                {profile?.cgpa !== null &&
                                                profile?.cgpa !== undefined &&
                                                profile?.cgpa !== ""
                                                    ? profile.cgpa
                                                    : "Not set"}
                                            </span>
                                        </span>

                                        <span className="text-xs text-slate-500">
                                            Graduation:{" "}
                                            <span className="font-semibold text-slate-700">
                                                {profile?.graduationYear ||
                                                    "Not set"}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to="/student/profile"
                                className="flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-blue-600 hover:text-blue-700 lg:self-auto"
                            >
                                Update profile
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>


                    {/* FILTER BAR */}
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-3 xl:flex-row">
                            <div className="relative min-w-0 flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search by job title or company..."
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex">
                                {/* Department */}
                                <div className="relative sm:min-w-[150px] xl:w-auto">
                                    <select
                                        value={departmentFilter}
                                        onChange={(event) =>
                                            setDepartmentFilter(
                                                event.target.value
                                            )
                                        }
                                        className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-600 outline-none hover:border-slate-300 focus:border-blue-400 xl:min-w-[150px]"
                                    >
                                        <option value="ALL">
                                            Department
                                        </option>
                                        {departmentOptions.map(
                                            (department) => (
                                                <option
                                                    key={department}
                                                    value={department}
                                                >
                                                    {department}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>

                                {/* Location */}
                                <div className="relative sm:min-w-[150px] xl:w-auto">
                                    <select
                                        value={locationFilter}
                                        onChange={(event) =>
                                            setLocationFilter(
                                                event.target.value
                                            )
                                        }
                                        className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-600 outline-none hover:border-slate-300 focus:border-blue-400 xl:min-w-[150px]"
                                    >
                                        <option value="ALL">
                                            Location
                                        </option>
                                        {locationOptions.map(
                                            (location) => (
                                                <option
                                                    key={location}
                                                    value={location}
                                                >
                                                    {location}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>

                                {/* Eligibility */}
                                <div className="relative sm:min-w-[150px] xl:w-auto">
                                    <select
                                        value={eligibilityFilter}
                                        onChange={(event) =>
                                            setEligibilityFilter(
                                                event.target.value
                                            )
                                        }
                                        className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-600 outline-none hover:border-slate-300 focus:border-blue-400 xl:min-w-[170px]"
                                    >
                                        <option value="ALL">
                                            All eligibility
                                        </option>
                                        <option value="ELIGIBLE">
                                            Eligible only
                                        </option>
                                        <option value="INELIGIBLE">
                                            Not eligible
                                        </option>
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                                <span className="text-xs text-slate-500">
                                    Use filters to narrow the active openings.
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="self-start text-xs font-semibold text-blue-600 hover:text-blue-700 sm:self-auto"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>


                    {/* RESULT HEADER */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900">
                                Available Opportunities
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Showing {displayedJobs.length} of {jobs.length} active openings
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Sort by</span>

                            <div className="relative">
                                <select
                                    value={sortOrder}
                                    onChange={(event) =>
                                        setSortOrder(
                                            event.target.value
                                        )
                                    }
                                    className="appearance-none bg-transparent pr-5 font-medium text-slate-700 outline-none"
                                >
                                    <option value="RECENT">
                                        Recently posted
                                    </option>
                                    <option value="CGPA_LOW">
                                        Lowest CGPA
                                    </option>
                                    <option value="CGPA_HIGH">
                                        Highest CGPA
                                    </option>
                                    <option value="TITLE">
                                        Job title
                                    </option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                    </div>


                    {/* JOB LIST */}
                    <div className="space-y-4">
                        {displayedJobs.length > 0 ? (
                            displayedJobs.map((job) => {
                                const companyName =
                                    job?.company?.companyName ||
                                    "Company";

                                const eligibility =
                                    getEligibility(
                                        job,
                                        profile
                                    );

                                const alreadyApplied =
                                    appliedJobIds.has(
                                        String(job._id)
                                    );

                                return (
                                    <div
                                        key={job._id}
                                        className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5 lg:p-6"
                                    >
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex min-w-0 gap-3 sm:gap-4">
                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${getLogoStyle(
                                                        companyName
                                                    )}`}
                                                >
                                                    {getInitial(
                                                        companyName
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="break-words text-base font-semibold text-slate-900 sm:text-lg">
                                                            {job.title}
                                                        </h4>

                                                        <span className="inline-flex shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                            ACTIVE
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-sm font-medium text-slate-600">
                                                        {companyName}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                            {job.location ||
                                                                "Location not specified"}
                                                        </span>

                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />
                                                            {formatEmploymentType(
                                                                job.employmentType
                                                            )}
                                                        </span>

                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Clock3 className="h-3.5 w-3.5 shrink-0" />
                                                            Posted {formatPostedDate(
                                                                job.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`flex w-fit max-w-full items-center gap-2 rounded-lg px-3 py-2 ${
                                                    eligibility.eligible
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-red-50 text-red-600"
                                                }`}
                                            >
                                                {eligibility.eligible ? (
                                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 shrink-0" />
                                                )}

                                                <span className="whitespace-nowrap text-xs font-semibold">
                                                    {eligibility.eligible
                                                        ? "Eligible to apply"
                                                        : "Not eligible"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="my-5 border-t border-slate-100" />

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Minimum CGPA
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {Number(
                                                        job.minimumCGPA
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Departments
                                                </p>

                                                <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                                    {Array.isArray(
                                                        job.allowedDepartments
                                                    ) &&
                                                    job.allowedDepartments.length > 0
                                                        ? job.allowedDepartments.join(
                                                              ", "
                                                          )
                                                        : "Not specified"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Graduation Year
                                                </p>

                                                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                                                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    {job.graduationYear ||
                                                        "Not specified"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Application Deadline
                                                </p>

                                                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                                                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    {formatDeadline(
                                                        job.applicationDeadline
                                                    )}
                                                </p>
                                            </div>


                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Your CGPA
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {profile?.cgpa !== null &&
                                                    profile?.cgpa !== undefined &&
                                                    profile?.cgpa !== ""
                                                        ? Number(
                                                              profile.cgpa
                                                          ).toFixed(2)
                                                        : "Not set"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                Required Skills
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {Array.isArray(
                                                    job.skills
                                                ) &&
                                                job.skills.length > 0 ? (
                                                    job.skills.map(
                                                        (skill) => (
                                                            <span
                                                                key={skill}
                                                                className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                                                            >
                                                                {skill}
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

                                        {!eligibility.eligible && (
                                            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3.5">
                                                <div className="flex items-start gap-2">
                                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-red-700">
                                                            Application unavailable
                                                        </p>

                                                        <p className="mt-1 break-words text-xs leading-5 text-red-600">
                                                            {eligibility.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {alreadyApplied && (
                                            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-3.5">
                                                <p className="text-xs font-semibold text-blue-700">
                                                    You have already applied for this opportunity.
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-blue-600">
                                                    Track the application from My Applications.
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                            <p className="min-w-0 text-xs leading-5 text-slate-500">
                                                {job.description ||
                                                    "No additional job description provided."}
                                            </p>

                                            {alreadyApplied ? (
                                                <Link
                                                    to="/student/applications"
                                                    className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                                                >
                                                    View Application
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={`/student/jobs/${job._id}`}
                                                    className={`flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition sm:w-auto ${
                                                        eligibility.eligible
                                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                                            : "cursor-not-allowed bg-slate-100 text-slate-400"
                                                    }`}
                                                    onClick={(event) => {
                                                        if (
                                                            !eligibility.eligible
                                                        ) {
                                                            event.preventDefault();
                                                        }
                                                    }}
                                                    aria-disabled={!eligibility.eligible}
                                                >
                                                    {eligibility.eligible
                                                        ? "View & Apply"
                                                        : "Application blocked"}

                                                    {eligibility.eligible && (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                                <BriefcaseBusiness className="mx-auto h-9 w-9 text-slate-300" />

                                <h4 className="mt-3 text-sm font-semibold text-slate-800">
                                    No opportunities found
                                </h4>

                                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                                    Try changing your search or filters. Active openings are loaded from the placement database.
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>


                    {/* FOOTER */}
                    <div className="flex items-center justify-center px-4 py-8 text-center">
                        <p className="text-xs leading-5 text-slate-400">
                            Showing approved and active opportunities available through CampusHire
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default BrowseJobs;
