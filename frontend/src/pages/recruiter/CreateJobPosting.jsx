import React, { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Building2,
    BriefcaseBusiness,
    Users,
    LogOut,
    ChevronDown,
    ArrowLeft,
    MapPin,
    GraduationCap,
    Plus,
    X,
    Info,
    CheckCircle2,
    AlertCircle,
    Menu,
    CalendarDays
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import {
    createJob,
    updateJob,
    getJobById
} from "../../api/jobs.js";

import {
    getMyCompany
} from "../../api/companies.js";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";

function CreateJobPosting() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const user = getCurrentUser();

    const editJobId = searchParams.get("edit");
    const isEditMode = Boolean(editJobId);

    // ========================================================
    // STATE
    // ========================================================

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [company, setCompany] =
        useState(null);

    const [loadingCompany, setLoadingCompany] =
        useState(true);

    const [companyError, setCompanyError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [loadingJob, setLoadingJob] =
        useState(false);

    const [editJobStatus, setEditJobStatus] =
        useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        employmentType: "FULL_TIME",
        minimumCGPA: "",
        graduationYear: "",
        applicationDeadline: "",
        allowedDepartments: [],
        skills: []
    });

    const [skillInput, setSkillInput] =
        useState("");

    // ========================================================
    // DEPARTMENTS
    // ========================================================

    const departments = [
        "CSE",
        "IT",
        "BCA",
        "ECE",
        "EEE",
        "MECH",
        "CIVIL",
        "BIO",
        "OTHER"
    ];

    // ========================================================
    // LOAD COMPANY
    // ========================================================

    useEffect(() => {

        const loadCompany = async () => {

            try {

                setLoadingCompany(true);
                setCompanyError("");

                const data =
                    await getMyCompany();

                setCompany(
                    data.company
                );

            } catch (err) {

                console.error(
                    "Failed to load company:",
                    err
                );

                setCompanyError(
                    err.message ||
                    "Unable to load your company"
                );

            } finally {

                setLoadingCompany(false);

            }
        };

        loadCompany();

    }, []);

    // ========================================================
    // LOAD JOB FOR EDIT MODE
    // ========================================================

    useEffect(() => {

        if (!editJobId) {
            return;
        }

        const loadJobForEdit = async () => {

            try {

                setLoadingJob(true);
                setError("");

                const data =
                    await getJobById(editJobId);

                const job =
                    data?.job;

                if (!job) {
                    throw new Error(
                        "Job posting could not be found."
                    );
                }

                const creatorId =
                    job?.createdBy?._id ||
                    job?.createdBy?.id ||
                    job?.createdBy;

                const currentUserId =
                    user?.id ||
                    user?._id;

                if (
                    creatorId &&
                    currentUserId &&
                    String(creatorId) !==
                        String(currentUserId)
                ) {
                    throw new Error(
                        "You can only edit your own job postings."
                    );
                }

                if (
                    job.status === "CLOSED"
                ) {
                    throw new Error(
                        "Closed job postings cannot be edited."
                    );
                }

                setEditJobStatus(
                    job.status || ""
                );

                let deadlineValue = "";

                if (
                    job.applicationDeadline
                ) {

                    const deadline =
                        new Date(
                            job.applicationDeadline
                        );

                    if (
                        !Number.isNaN(
                            deadline.getTime()
                        )
                    ) {

                        const year =
                            deadline.getFullYear();

                        const month =
                            String(
                                deadline.getMonth() + 1
                            ).padStart(2, "0");

                        const day =
                            String(
                                deadline.getDate()
                            ).padStart(2, "0");

                        deadlineValue =
                            `${year}-${month}-${day}`;
                    }
                }

                setFormData({
                    title:
                        job.title || "",

                    description:
                        job.description || "",

                    location:
                        job.location || "",

                    employmentType:
                        job.employmentType ||
                        "FULL_TIME",

                    minimumCGPA:
                        job.minimumCGPA !==
                            undefined &&
                        job.minimumCGPA !==
                            null
                            ? String(
                                job.minimumCGPA
                            )
                            : "",

                    graduationYear:
                        job.graduationYear !==
                            undefined &&
                        job.graduationYear !==
                            null
                            ? String(
                                job.graduationYear
                            )
                            : "",

                    applicationDeadline:
                        deadlineValue,

                    allowedDepartments:
                        Array.isArray(
                            job.allowedDepartments
                        )
                            ? job.allowedDepartments
                            : [],

                    skills:
                        Array.isArray(
                            job.skills
                        )
                            ? job.skills
                            : []
                });

                setSkillInput("");

            } catch (err) {

                console.error(
                    "Failed to load job for editing:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load this job posting for editing."
                );

            } finally {

                setLoadingJob(false);

            }
        };

        loadJobForEdit();

    }, [editJobId]);

    // ========================================================
    // INPUT HANDLER
    // ========================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

        setError("");
        setSuccess("");

    };

    // ========================================================
    // DEPARTMENT TOGGLE
    // ========================================================

    const toggleDepartment = (
        department
    ) => {

        setFormData(
            (previous) => {

                const alreadySelected =
                    previous.allowedDepartments.includes(
                        department
                    );

                return {
                    ...previous,

                    allowedDepartments:
                        alreadySelected
                            ? previous.allowedDepartments.filter(
                                (item) =>
                                    item !==
                                    department
                            )
                            : [
                                ...previous.allowedDepartments,
                                department
                            ]
                };

            }
        );

        setError("");

    };

    // ========================================================
    // LOGOUT
    // ========================================================

    const handleSkillKeyDown = (event) => {

        if (
            event.key !== "Enter"
        ) {
            return;
        }

        event.preventDefault();

        const skill =
            skillInput.trim();

        if (!skill) {
            return;
        }

        setFormData(
            (previous) => {

                const alreadyExists =
                    previous.skills.some(
                        (item) =>
                            item.toLowerCase() ===
                            skill.toLowerCase()
                    );

                if (alreadyExists) {
                    return previous;
                }

                return {
                    ...previous,
                    skills: [
                        ...previous.skills,
                        skill
                    ]
                };

            }
        );

        setSkillInput("");
        setError("");
        setSuccess("");

    };

    const removeSkill = (
        skillToRemove
    ) => {

        setFormData(
            (previous) => ({
                ...previous,

                skills:
                    previous.skills.filter(
                        (skill) =>
                            skill !==
                            skillToRemove
                    )
            })
        );

        setError("");
        setSuccess("");

    };

    const handleLogout = () => {

        logoutUser();

        navigate("/login");

    };

    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        // ----------------------------------------------------
        // BASIC VALIDATION
        // ----------------------------------------------------

        if (
            !formData.title.trim()
        ) {

            setError(
                "Job title is required."
            );

            return;
        }

        if (
            !formData.description.trim()
        ) {

            setError(
                "Job description is required."
            );

            return;
        }

        if (
            !formData.location.trim()
        ) {

            setError(
                "Location is required."
            );

            return;
        }

        if (
            !formData.applicationDeadline
        ) {

            setError(
                "Application deadline is required."
            );

            return;
        }

        const deadline =
            new Date(
                `${formData.applicationDeadline}T23:59:59`
            );

        if (
            Number.isNaN(
                deadline.getTime()
            ) ||
            deadline <= new Date()
        ) {

            setError(
                "Application deadline must be a valid future date."
            );

            return;
        }

        if (
            formData.minimumCGPA === ""
        ) {

            setError(
                "Minimum CGPA is required."
            );

            return;
        }

        const cgpa =
            Number(
                formData.minimumCGPA
            );

        if (
            Number.isNaN(cgpa) ||
            cgpa < 0 ||
            cgpa > 10
        ) {

            setError(
                "Minimum CGPA must be between 0 and 10."
            );

            return;
        }

        if (
            !formData.graduationYear
        ) {

            setError(
                "Graduation year is required."
            );

            return;
        }

        if (
            formData.allowedDepartments.length ===
            0
        ) {

            setError(
                "Select at least one allowed department."
            );

            return;
        }

        if (!company) {

            setError(
                "Your company profile could not be loaded."
            );

            return;
        }

        if (
            company.approvalStatus !==
            "APPROVED"
        ) {

            setError(
                "Your company must be approved by the Placement Cell before you can create a job posting."
            );

            return;
        }

        // ----------------------------------------------------
        // CREATE / UPDATE JOB
        // ----------------------------------------------------

        try {

            setSubmitting(true);

            const jobData = {

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                companyId:
                    company?._id,

                location:
                    formData.location.trim(),

                employmentType:
                    formData.employmentType,

                minimumCGPA:
                    cgpa,

                allowedDepartments:
                    formData.allowedDepartments,

                skills:
                    formData.skills,

                applicationDeadline:
                    deadline.toISOString(),

                graduationYear:
                    Number(
                        formData.graduationYear
                    )

            };

            if (isEditMode) {

                await updateJob(
                    editJobId,
                    jobData
                );

                setSuccess(
                    editJobStatus ===
                        "REJECTED"
                        ? "Job posting updated and resubmitted for Placement Cell approval."
                        : "Job posting updated successfully."
                );

            } else {

                await createJob(
                    jobData
                );

                setSuccess(
                    "Job posting submitted successfully for Placement Cell approval."
                );

            }

            setTimeout(() => {

                navigate(
                    "/recruiter/jobs"
                );

            }, 1000);

        } catch (err) {

            console.error(
                "Create job error:",
                err
            );

            setError(
                err.message ||
                "Failed to create job posting."
            );

        } finally {

            setSubmitting(false);

        }

    };

    // ========================================================
    // INITIALS
    // ========================================================

    const recruiterName =
        user?.name ||
        "Recruiter";

    const initials =
        recruiterName
            .split(" ")
            .filter(Boolean)
            .map(
                (part) =>
                    part[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() ||
        "R";

    // ========================================================
    // SIDEBAR
    // ========================================================

    const SidebarContent = ({
        mobile = false
    }) => {

        return (

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

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">

                            <BriefcaseBusiness className="h-5 w-5 text-white" />

                        </div>

                        <div>

                            <h1 className="text-base font-semibold text-slate-900">
                                CampusHire
                            </h1>

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
                            aria-label="Close menu"
                        >

                            <X className="h-5 w-5" />

                        </button>

                    )}

                </div>

                {/* Navigation */}

                <nav className="flex-1 px-3 py-5">

                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Workspace
                    </p>

                    <div className="space-y-1">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
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
                                navigate(
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
                                navigate(
                                    "/recruiter/jobs"
                                )
                            }
                            className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
                        >

                            <BriefcaseBusiness className="h-4 w-4" />

                            Job Postings

                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/recruiter/applicants"
                                )
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
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

                {/* Recruiter */}

                <div className="border-t border-slate-200 p-3">

                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">

                            {initials}

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

    };

    // ========================================================
    // PAGE
    // ========================================================

    return (

        <div className="min-h-screen overflow-x-hidden bg-slate-50">

            {/* ====================================================
                DESKTOP SIDEBAR
            ==================================================== */}

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">

                <SidebarContent />

            </aside>

            {/* ====================================================
                MOBILE SIDEBAR
            ==================================================== */}

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

                    <aside className="relative h-full w-[280px] max-w-[85vw] bg-white shadow-xl">

                        <SidebarContent
                            mobile
                        />

                    </aside>

                </div>

            )}

            {/* ====================================================
                MAIN
            ==================================================== */}

            <main className="min-h-screen min-w-0 lg:ml-64">

                {/* ==================================================
                    TOP BAR
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

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/recruiter/jobs"
                                )
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                            aria-label="Back to job postings"
                        >

                            <ArrowLeft className="h-4 w-4" />

                        </button>

                        <div>

                            <p className="text-sm font-semibold text-slate-800">
                                {isEditMode
                                    ? "Edit Job Posting"
                                    : "Create Job Posting"}
                            </p>

                            <p className="text-[11px] text-slate-400">
                                Recruiter Portal
                            </p>

                        </div>

                    </div>

                    {/* Recruiter */}

                    <div className="flex items-center gap-2 sm:gap-3">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-slate-800">
                                {recruiterName}
                            </p>

                            <p className="text-[11px] text-slate-500">
                                Recruiter
                            </p>

                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">

                            {initials}

                        </div>

                        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />

                    </div>

                </header>

                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div className="mx-auto w-full max-w-[1050px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

                    {/* Heading */}

                    <div className="mb-7">

                        <p className="mb-1 text-sm font-medium text-blue-600">
                            Recruitment Management
                        </p>

                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">

                            {isEditMode
                                ? "Edit Job Posting"
                                : "Create Job Posting"}

                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Create a recruitment opportunity and submit it for Placement Cell approval.
                        </p>

                    </div>

                    {/* ==================================================
                        COMPANY STATUS
                    ================================================== */}

                    {loadingCompany && (

                        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5">

                            <p className="text-sm text-slate-500">
                                Loading company information...
                            </p>

                        </div>

                    )}

                    {!loadingCompany &&
                        companyError && (

                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">

                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                                <div>

                                    <h3 className="text-sm font-semibold text-red-800">
                                        Unable to load company
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-red-700">
                                        {companyError}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/recruiter/company"
                                            )
                                        }
                                        className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                    >
                                        Go to Company Profile
                                    </button>

                                </div>

                            </div>

                        )}

                    {!loadingCompany &&
                        company &&
                        company.approvalStatus !==
                            "APPROVED" && (

                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">

                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                                <div>

                                    <h3 className="text-sm font-semibold text-amber-900">
                                        Company approval required
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-amber-700">

                                        {isEditMode

                                            ? editJobStatus ===
                                                "REJECTED"

                                                ? "This edited posting will return to Pending Review and must be approved again before students can view or apply."

                                                : "Changes are saved to the existing posting. Students will continue to see the posting according to its current approval status."

                                            : (
                                                <>
                                                    This job posting will not be visible to students immediately. After submission, it will enter{" "}

                                                    <strong>
                                                        Pending Review
                                                    </strong>{" "}

                                                    status and must be approved by the Placement Cell before students can view or apply.
                                                </>
                                            )}

                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/recruiter/company"
                                            )
                                        }
                                        className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                                    >
                                        View Company Profile
                                    </button>

                                </div>

                            </div>

                        )}

                    {/* ==================================================
                        FORM
                    ================================================== */}

                    {loadingJob &&
                        isEditMode && (

                            <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">

                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                                <p className="text-sm font-medium text-blue-800">
                                    Loading job details for editing...
                                </p>

                            </div>

                        )}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-5"
                    >

                        {/* ==================================================
                            JOB DETAILS
                        ================================================== */}

                        <section className="rounded-xl border border-slate-200 bg-white">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">

                                        <BriefcaseBusiness className="h-4 w-4 text-blue-600" />

                                    </div>

                                    <div>

                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Job Details
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Basic information about the position.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">

                                {/* Job title */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-xs font-semibold text-slate-600">

                                        Job Title{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={
                                            formData.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Software Development Engineer"
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                                {/* Employment Type */}

                                <div>

                                    <label className="mb-2 block text-xs font-semibold text-slate-600">

                                        Employment Type{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    </label>

                                    <select
                                        name="employmentType"
                                        value={
                                            formData.employmentType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="FULL_TIME">
                                            Full-time
                                        </option>

                                        <option value="INTERNSHIP">
                                            Internship
                                        </option>

                                    </select>

                                </div>

                                {/* Location */}

                                <div>

                                    <label className="mb-2 block text-xs font-semibold text-slate-600">

                                        Location{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    </label>

                                    <div className="relative">

                                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            name="location"
                                            value={
                                                formData.location
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. Bangalore"
                                            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                                {/* Application Deadline */}

                                <div>

                                    <label className="mb-2 block text-xs font-semibold text-slate-600">

                                        Application Deadline{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    </label>

                                    <div className="relative">

                                        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="date"
                                            name="applicationDeadline"
                                            value={
                                                formData.applicationDeadline
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                    <p className="mt-1.5 text-[11px] text-slate-400">
                                        Students can apply until the end of this date.
                                    </p>

                                </div>

                                {/* Description */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-xs font-semibold text-slate-600">

                                        Job Description{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="6"
                                        placeholder="Describe the role, responsibilities, team, and what the selected candidate will work on..."
                                        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                                {/* Required Skills */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                                        Required Skills
                                    </label>

                                    <div className="rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                                        {formData.skills.length > 0 && (

                                            <div className="mb-3 flex flex-wrap gap-2">

                                                {formData.skills.map(
                                                    (skill) => (

                                                        <span
                                                            key={
                                                                skill
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                                                        >

                                                            {skill}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeSkill(
                                                                        skill
                                                                    )
                                                                }
                                                                className="flex h-4 w-4 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-100 hover:text-blue-700"
                                                                aria-label={`Remove ${skill}`}
                                                            >

                                                                <X className="h-3.5 w-3.5" />

                                                            </button>

                                                        </span>

                                                    )
                                                )}

                                            </div>

                                        )}

                                        <input
                                            type="text"
                                            value={
                                                skillInput
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSkillInput(
                                                    event.target.value
                                                )
                                            }
                                            onKeyDown={
                                                handleSkillKeyDown
                                            }
                                            placeholder="Type a skill and press Enter..."
                                            className="h-9 w-full bg-transparent px-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                        />

                                    </div>

                                    <p className="mt-1.5 text-[11px] text-slate-400">
                                        Add skills one at a time. Press Enter after each skill.
                                    </p>

                                </div>

                            </div>

                        </section>

                        {/* ==================================================
                            ELIGIBILITY
                        ================================================== */}

                        <section className="rounded-xl border border-slate-200 bg-white">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">

                                        <GraduationCap className="h-4 w-4 text-violet-600" />

                                    </div>

                                    <div>

                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Eligibility Criteria
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            These rules will be used by the system to determine whether a student can apply.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-5 sm:p-6">

                                {/* Info */}

                                <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">

                                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                                    <p className="text-xs leading-5 text-blue-800">

                                        <strong>
                                            Server-side eligibility check:
                                        </strong>{" "}

                                        The student's CGPA, department, and graduation year will be checked against these criteria before an application can be submitted.

                                    </p>

                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                    {/* Minimum CGPA */}

                                    <div>

                                        <label className="mb-2 block text-xs font-semibold text-slate-600">

                                            Minimum CGPA{" "}

                                            <span className="text-red-500">
                                                *
                                            </span>

                                        </label>

                                        <div className="relative">

                                            <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                            <input
                                                type="number"
                                                name="minimumCGPA"
                                                value={
                                                    formData.minimumCGPA
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="0"
                                                max="10"
                                                step="0.01"
                                                placeholder="e.g. 8.00"
                                                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                        <p className="mt-1.5 text-[11px] text-slate-400">
                                            Scale: 0.00 – 10.00
                                        </p>

                                    </div>

                                    {/* Graduation Year */}

                                    <div>

                                        <label className="mb-2 block text-xs font-semibold text-slate-600">

                                            Eligible Graduation Year{" "}

                                            <span className="text-red-500">
                                                *
                                            </span>

                                        </label>

                                        <select
                                            name="graduationYear"
                                            value={
                                                formData.graduationYear
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >

                                            <option value="">
                                                Select year
                                            </option>

                                            <option value="2026">
                                                2026
                                            </option>

                                            <option value="2027">
                                                2027
                                            </option>

                                            <option value="2028">
                                                2028
                                            </option>

                                            <option value="2029">
                                                2029
                                            </option>

                                            <option value="2030">
                                                2030
                                            </option>

                                            <option value="2031">
                                                2031
                                            </option>

                                        </select>

                                    </div>

                                </div>

                                {/* Departments */}

                                <div className="mt-6">

                                    <label className="mb-2 block text-xs font-semibold text-slate-600">

                                        Allowed Departments{" "}

                                        <span className="text-red-500">
                                            *
                                        </span>

                                    </label>

                                    <div className="flex flex-wrap gap-2">

                                        {departments.map(
                                            (
                                                department
                                            ) => {

                                                const selected =
                                                    formData.allowedDepartments.includes(
                                                        department
                                                    );

                                                return (

                                                    <button
                                                        key={
                                                            department
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            toggleDepartment(
                                                                department
                                                            )
                                                        }
                                                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                                            selected
                                                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                        }`}
                                                    >

                                                        <span className="flex items-center gap-1.5">

                                                            {selected && (
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            )}

                                                            {department}

                                                        </span>

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>

                                    <p className="mt-2 text-[11px] text-slate-400">
                                        Only students belonging to the selected departments will be eligible to apply.
                                    </p>

                                </div>

                            </div>

                        </section>

                        {/* ==================================================
                            COMPANY INFORMATION
                        ================================================== */}

                        {company && (

                            <section className="rounded-xl border border-slate-200 bg-white">

                                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">

                                            <Building2 className="h-4 w-4 text-orange-600" />

                                        </div>

                                        <div>

                                            <h2 className="text-sm font-semibold text-slate-900">
                                                Company
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                This job will be posted under your approved company.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="p-5 sm:p-6">

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                                        <div className="flex items-center justify-between gap-4">

                                            <div className="min-w-0">

                                                <p className="text-sm font-semibold text-slate-900">
                                                    {company.companyName}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">

                                                    {company.industry}

                                                    {" • "}

                                                    {company.location}

                                                </p>

                                            </div>

                                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                                                Approved
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </section>

                        )}

                        {/* ==================================================
                            APPROVAL NOTICE
                        ================================================== */}

                        {isEditMode && (

                            <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-5">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                                        <Info className="h-5 w-5 text-blue-600" />

                                    </div>

                                    <div>

                                        <h3 className="text-sm font-semibold text-blue-900">

                                            {editJobStatus ===
                                                "REJECTED"

                                                ? "Edit and resubmit this job posting"

                                                : "Editing existing job posting"}

                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-blue-800">

                                            {editJobStatus ===
                                                "REJECTED"

                                                ? "Saving your changes will send the posting back to Pending Review for Placement Cell approval."

                                                : "Your changes will be saved to the existing job posting. Its current approval status will remain unchanged."}

                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">

                            <div className="flex items-start gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                                    <CheckCircle2 className="h-5 w-5 text-amber-600" />

                                </div>

                                <div>

                                    <h3 className="text-sm font-semibold text-amber-900">

                                        {isEditMode
                                            ? "Posting workflow"
                                            : "Placement Cell approval required"}

                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-amber-800">

                                        {isEditMode

                                            ? editJobStatus ===
                                                "REJECTED"

                                                ? "This edited posting will return to Pending Review and must be approved again before students can view or apply."

                                                : "Changes are saved to the existing posting. Students will continue to see the posting according to its current approval status."

                                            : (

                                                <>

                                                    This job posting will not be visible to students immediately. After submission, it will enter{" "}

                                                    <strong>
                                                        Pending Review
                                                    </strong>{" "}

                                                    status and must be approved by the Placement Cell before students can view or apply.

                                                </>

                                            )}

                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* ==================================================
                            ERROR
                        ================================================== */}

                        {error && (

                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                                <p className="text-sm leading-5 text-red-700">
                                    {error}
                                </p>

                            </div>

                        )}

                        {/* ==================================================
                            SUCCESS
                        ================================================== */}

                        {success && (

                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                                <p className="text-sm leading-5 text-emerald-700">
                                    {success}
                                </p>

                            </div>

                        )}

                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/recruiter/jobs"
                                    )
                                }
                                disabled={
                                    submitting
                                }
                                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    loadingCompany ||
                                    loadingJob ||
                                    !company ||
                                    company.approvalStatus !==
                                        "APPROVED"
                                }
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >

                                {submitting ? (

                                    <>

                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                        {isEditMode
                                            ? "Saving..."
                                            : "Submitting..."}

                                    </>

                                ) : (

                                    <>

                                        {isEditMode ? (

                                            <CheckCircle2 className="h-4 w-4" />

                                        ) : (

                                            <Plus className="h-4 w-4" />

                                        )}

                                        {isEditMode
                                            ? "Save Changes"
                                            : "Submit for Approval"}

                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>

    );

}

export default CreateJobPosting;