import React, { useEffect, useMemo, useState } from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    LayoutDashboard,
    BriefcaseBusiness,
    FileText,
    UserRound,
    LogOut,
    ChevronDown,
    GraduationCap,
    ArrowLeft,
    MapPin,
    Clock3,
    CalendarDays,
    CheckCircle2,
    Building2,
    ExternalLink,
    FileText as ResumeIcon,
    AlertCircle,
    ChevronRight,
    Menu,
    X,
    Loader2
} from "lucide-react";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

import {
    getProfile
} from "../../api/users.js";

import {
    getJobById
} from "../../api/jobs.js";

import {
    applyForJob,
    getMyApplications
} from "../../api/applications.js";


const formatEmploymentType = (value) => {
    if (value === "FULL_TIME") {
        return "Full-time";
    }

    if (value === "INTERNSHIP") {
        return "Internship";
    }

    return value || "Not specified";
};


const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
};


const formatPostedDate = (value) => {
    if (!value) {
        return "recently";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "recently";
    }

    const diff = Date.now() - date.getTime();

    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;

    if (diff < minute) {
        return "just now";
    }

    if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (diff < day) {
        const hours = Math.floor(diff / hour);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    const days = Math.floor(diff / day);

    if (days === 1) {
        return "1 day ago";
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    return formatDate(value);
};


const getInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || "C";
};


const getEligibility = (job, student) => {
    const reasons = [];

    if (!student) {
        return {
            eligible: false,
            reasons: [
                "Your student profile could not be loaded."
            ]
        };
    }

    if (
        student.cgpa === null ||
        student.cgpa === undefined ||
        student.cgpa === ""
    ) {
        reasons.push("your CGPA is not updated");
    } else if (
        Number(student.cgpa) <
        Number(job?.minimumCGPA)
    ) {
        reasons.push(
            `minimum CGPA is ${Number(job?.minimumCGPA).toFixed(2)}, but your CGPA is ${Number(student.cgpa).toFixed(2)}`
        );
    }

    if (!student.department) {
        reasons.push(
            "your department is not updated"
        );
    } else {
        const allowedDepartments =
            Array.isArray(
                job?.allowedDepartments
            )
                ? job.allowedDepartments
                : [];

        const matches =
            allowedDepartments.some(
                (department) =>
                    String(department)
                        .trim()
                        .toLowerCase() ===
                    String(student.department)
                        .trim()
                        .toLowerCase()
            );

        if (!matches) {
            reasons.push(
                `your department (${student.department}) is not among ${allowedDepartments.join(", ") || "the listed departments"}`
            );
        }
    }

    if (
        student.graduationYear === null ||
        student.graduationYear === undefined ||
        student.graduationYear === ""
    ) {
        reasons.push(
            "your graduation year is not updated"
        );
    } else if (
        Number(student.graduationYear) !==
        Number(job?.graduationYear)
    ) {
        reasons.push(
            `this posting is for graduation year ${job?.graduationYear}`
        );
    }

    return {
        eligible: reasons.length === 0,
        reasons
    };
};


function StudentJobDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [job, setJob] = useState(null);
    const [student, setStudent] = useState(null);
    const [application, setApplication] = useState(null);

    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    const [error, setError] = useState("");
    const [applyError, setApplyError] = useState("");
    const [success, setSuccess] = useState("");


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
                    getJobById(id),
                    getMyApplications()
                ]);

                if (cancelled) {
                    return;
                }

                const loadedStudent =
                    profileData?.user || null;

                const loadedJob =
                    jobData?.job || null;

                setStudent(loadedStudent);
                setJob(loadedJob);

                const foundApplication =
                    Array.isArray(
                        applicationData?.applications
                    )
                        ? applicationData.applications.find(
                              (item) =>
                                  String(
                                      item?.job?._id
                                  ) === String(id)
                          )
                        : null;

                setApplication(
                    foundApplication || null
                );

                if (
                    loadedStudent &&
                    loadedStudent.name
                ) {
                    const storedUser =
                        getCurrentUser();

                    if (storedUser) {
                        localStorage.setItem(
                            "campushire_user",
                            JSON.stringify({
                                ...storedUser,
                                ...loadedStudent
                            })
                        );
                    }
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Student job details error:",
                    err
                );

                setError(
                    err.message ||
                        "Unable to load this job."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (!id) {
            setError("Invalid job ID.");
            setLoading(false);
            return;
        }

        loadData();

        return () => {
            cancelled = true;
        };
    }, [id]);


    const eligibility = useMemo(
        () => getEligibility(job, student),
        [job, student]
    );


    const deadlineDate = useMemo(() => {
        if (!job?.applicationDeadline) {
            return null;
        }

        const date = new Date(
            job.applicationDeadline
        );

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }, [job]);


    const deadlinePassed =
        !deadlineDate ||
        deadlineDate.getTime() <= Date.now();


    const canApply =
        Boolean(
            job &&
            job.status === "ACTIVE" &&
            !deadlinePassed &&
            eligibility.eligible &&
            !application
        );


    const studentName =
        student?.name ||
        getCurrentUser()?.name ||
        "Student";

    const studentInitial =
        getInitial(studentName);

    const companyName =
        job?.company?.companyName ||
        "Company";

    const recruiterName =
        job?.createdBy?.name ||
        "Recruiter";


    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };


    const handleApply = async () => {
        if (!job?._id) {
            return;
        }

        if (!canApply) {
            return;
        }

        try {
            setApplying(true);
            setApplyError("");
            setSuccess("");

            const result =
                await applyForJob(
                    job._id
                );

            setApplication(
                result?.application || {
                    job
                }
            );

            setSuccess(
                "Application submitted successfully."
            );
        } catch (err) {
            console.error(
                "Apply for job error:",
                err
            );

            setApplyError(
                err.message ||
                    "Unable to submit your application."
            );
        } finally {
            setApplying(false);
        }
    };


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="text-center">
                    <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading job details...
                    </p>
                </div>
            </div>
        );
    }


    if (error || !job) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm">
                    <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        Unable to load job
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error || "Job not found."}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/student/jobs")
                        }
                        className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Back to Browse Jobs
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="flex min-h-screen overflow-x-hidden bg-slate-50">

            {mobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={closeMobileMenu}
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                />
            )}


            <aside
                className={`fixed bottom-0 left-0 top-0 z-40 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
                    mobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                } lg:translate-x-0`}
            >

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


                <div className="shrink-0 border-t border-slate-100 p-4">

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {studentInitial}
                        </div>

                        <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-slate-800">
                                {studentName}
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                                {student?.department ||
                                    "Department not set"}

                                {student?.cgpa !==
                                    null &&
                                student?.cgpa !==
                                    undefined &&
                                student?.cgpa !== ""
                                    ? ` · ${student.cgpa} CGPA`
                                    : ""}
                            </p>

                        </div>

                    </div>

                </div>

            </aside>


            <main className="min-h-screen min-w-0 flex-1 lg:ml-[250px]">

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

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/student/jobs")
                            }
                            className="hidden h-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 md:flex"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Browse Jobs
                        </button>

                    </div>


                    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-slate-800">
                                {studentName}
                            </p>

                            <p className="text-[11px] text-slate-500">
                                Student
                            </p>

                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {studentInitial}
                        </div>

                        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />

                    </div>

                </header>


                <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/student/jobs")
                        }
                        className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 sm:mb-6 md:hidden"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Browse Jobs
                    </button>


                    {/* JOB HEADER */}

                    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                            <div className="flex min-w-0 gap-3 sm:gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-lg font-bold text-orange-600 sm:h-14 sm:w-14 sm:text-xl">
                                    {getInitial(companyName)}
                                </div>

                                <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-2">

                                        <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                            {job.status === "ACTIVE"
                                                ? "ACTIVE"
                                                : job.status || "OPEN"}
                                        </span>

                                        {application && (
                                            <span className="inline-flex shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                                Applied
                                            </span>
                                        )}

                                    </div>

                                    <h1 className="mt-3 break-words text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                                        {job.title}
                                    </h1>

                                    <p className="mt-1 text-base font-medium text-slate-600">
                                        {companyName}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">

                                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            {job.location}
                                        </span>

                                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <BriefcaseBusiness className="h-4 w-4 shrink-0" />
                                            {formatEmploymentType(
                                                job.employmentType
                                            )}
                                        </span>

                                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <Clock3 className="h-4 w-4 shrink-0" />
                                            Posted{" "}
                                            {formatPostedDate(
                                                job.createdAt
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div className="border-t border-slate-100 pt-4 md:border-t-0 md:pt-0 md:text-right">

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Application deadline
                                </p>

                                <p
                                    className={`mt-1 text-sm font-semibold ${
                                        deadlinePassed
                                            ? "text-red-600"
                                            : "text-slate-800"
                                    }`}
                                >
                                    {deadlineDate
                                        ? formatDate(
                                              deadlineDate
                                          )
                                        : "Deadline not set"}
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">

                        <div className="min-w-0 space-y-6">

                            {/* About */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <h2 className="text-lg font-semibold text-slate-900">
                                    About the role
                                </h2>

                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                                    {job.description ||
                                        "No job description provided."}
                                </p>

                            </section>


                            {/* Skills */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Required skills
                                </h2>

                                {Array.isArray(job.skills) &&
                                job.skills.length > 0 ? (
                                    <div className="mt-5 flex flex-wrap gap-2">

                                        {job.skills.map(
                                            (skill) => (
                                                <span
                                                    key={
                                                        skill
                                                    }
                                                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600"
                                                >
                                                    {
                                                        skill
                                                    }
                                                </span>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm text-slate-400">
                                        No specific skills listed.
                                    </p>
                                )}

                            </section>


                            {/* Company */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                        <Building2 className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">

                                        <h2 className="font-semibold text-slate-900">
                                            {companyName}
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {job.company?.industry ||
                                                "Verified recruiting organization"}
                                        </p>

                                    </div>

                                </div>

                                {job.company?.website && (
                                    <a
                                        href={
                                            job.company.website
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Visit company website
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}

                            </section>

                        </div>


                        <div className="min-w-0 space-y-6">

                            {/* Eligibility */}

                            <section
                                className={`rounded-xl border bg-white p-5 sm:p-6 ${
                                    eligibility.eligible &&
                                    !deadlinePassed
                                        ? "border-emerald-200"
                                        : "border-red-200"
                                }`}
                            >

                                <div className="flex items-center gap-3">

                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                            eligibility.eligible &&
                                            !deadlinePassed
                                                ? "bg-emerald-50"
                                                : "bg-red-50"
                                        }`}
                                    >

                                        {eligibility.eligible &&
                                        !deadlinePassed ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        )}

                                    </div>

                                    <div className="min-w-0">

                                        <h2 className="font-semibold text-slate-900">
                                            Application eligibility
                                        </h2>

                                        <p
                                            className={`mt-0.5 text-xs font-medium ${
                                                eligibility.eligible &&
                                                !deadlinePassed
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {deadlinePassed
                                                ? "The application deadline has passed"
                                                : eligibility.eligible
                                                  ? "You meet the eligibility requirements"
                                                  : "You do not meet the eligibility requirements"}
                                        </p>

                                    </div>

                                </div>

                                <div className="my-5 border-t border-slate-100" />


                                <div className="flex items-center justify-between gap-4 py-2">

                                    <span className="text-sm text-slate-500">
                                        Your CGPA
                                    </span>

                                    <span className="shrink-0 text-sm font-semibold text-slate-800">
                                        {student?.cgpa !==
                                            null &&
                                        student?.cgpa !==
                                            undefined
                                            ? Number(
                                                  student.cgpa
                                              ).toFixed(2)
                                            : "Not set"}
                                    </span>

                                </div>


                                <div className="flex items-center justify-between gap-4 py-2">

                                    <span className="text-sm text-slate-500">
                                        Required CGPA
                                    </span>

                                    <span className="shrink-0 text-sm font-semibold text-slate-800">
                                        {Number(
                                            job.minimumCGPA
                                        ).toFixed(2)}
                                    </span>

                                </div>


                                <div className="flex items-center justify-between gap-4 py-2">

                                    <span className="text-sm text-slate-500">
                                        Your department
                                    </span>

                                    <span className="shrink-0 text-sm font-semibold text-slate-800">
                                        {student?.department ||
                                            "Not set"}
                                    </span>

                                </div>


                                <div className="flex items-start justify-between gap-4 py-2">

                                    <span className="min-w-0 text-sm text-slate-500">
                                        Eligible departments
                                    </span>

                                    <span className="max-w-[60%] break-words text-right text-sm font-semibold text-slate-800">
                                        {Array.isArray(
                                            job.allowedDepartments
                                        )
                                            ? job.allowedDepartments.join(
                                                  ", "
                                              )
                                            : "Not specified"}
                                    </span>

                                </div>


                                <div className="flex items-start justify-between gap-4 py-2">

                                    <span className="text-sm text-slate-500">
                                        Graduation year
                                    </span>

                                    <span className="shrink-0 text-sm font-semibold text-slate-800">
                                        {student?.graduationYear ||
                                            "Not set"}
                                    </span>

                                </div>


                                {!eligibility.eligible &&
                                    !deadlinePassed && (
                                        <div className="mt-4 rounded-lg bg-red-50 p-3.5">

                                            <div className="flex items-start gap-2">

                                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                                                <p className="text-xs leading-5 text-red-700">
                                                    You cannot apply because{" "}
                                                    {eligibility.reasons.join(
                                                        "; "
                                                    )}
                                                    .
                                                </p>

                                            </div>

                                        </div>
                                    )}

                                {deadlinePassed && (
                                    <div className="mt-4 rounded-lg bg-red-50 p-3.5">

                                        <div className="flex items-start gap-2">

                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                                            <p className="text-xs leading-5 text-red-700">
                                                Applications are no longer accepted because the deadline has passed.
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </section>


                            {/* Application */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

                                <h2 className="font-semibold text-slate-900">
                                    Application
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Your current student profile and resume will be submitted with this application.
                                </p>


                                <div className="mt-5 rounded-lg bg-slate-50 p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                            {studentInitial}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {studentName}
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {student?.department ||
                                                    "Department not set"}{" "}
                                                · Class of{" "}
                                                {student?.graduationYear ||
                                                    "—"}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">

                                        <div className="flex min-w-0 items-center gap-2">

                                            <ResumeIcon className="h-4 w-4 shrink-0 text-slate-400" />

                                            <span className="truncate text-xs font-medium text-slate-600">
                                                {student?.resumeLink ||
                                                    "No resume link added"}
                                            </span>

                                        </div>

                                        {student?.resumeLink && (
                                            <a
                                                href={
                                                    student.resumeLink
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                View
                                            </a>
                                        )}

                                    </div>

                                </div>


                                {applyError && (
                                    <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3.5">

                                        <div className="flex items-start gap-2">

                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                                            <p className="text-xs leading-5 text-red-700">
                                                {applyError}
                                            </p>

                                        </div>

                                    </div>
                                )}


                                {success && (
                                    <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3.5">

                                        <div className="flex items-start gap-2">

                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                                            <p className="text-xs leading-5 text-emerald-700">
                                                {success}
                                            </p>

                                        </div>

                                    </div>
                                )}


                                {application ? (
                                    <Link
                                        to="/student/applications"
                                        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        View My Application
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={
                                            !canApply ||
                                            applying
                                        }
                                        onClick={
                                            handleApply
                                        }
                                        className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                                            canApply
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "cursor-not-allowed bg-slate-100 text-slate-400"
                                        }`}
                                    >

                                        {applying ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : deadlinePassed ? (
                                            "Application closed"
                                        ) : eligibility.eligible ? (
                                            "Apply for this position"
                                        ) : (
                                            "Application blocked"
                                        )}

                                        {canApply && (
                                            <ChevronRight className="h-4 w-4" />
                                        )}

                                    </button>
                                )}

                                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                                    Application deadline:{" "}
                                    {deadlineDate
                                        ? formatDate(
                                              deadlineDate
                                          )
                                        : "Not set"}
                                </p>

                            </section>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}


export default StudentJobDetails;
