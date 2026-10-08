import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Building2,
    BriefcaseBusiness,
    Users,
    LogOut,
    ChevronDown,
    Search,
    Pencil,
    Globe,
    MapPin,
    UsersRound,
    Mail,
    UserRound,
    ShieldCheck,
    CheckCircle2,
    CalendarDays,
    ExternalLink,
    Menu,
    X,
    Save,
    Plus,
    AlertCircle,
    Clock3,
    XCircle
} from "lucide-react";

import {
    getMyCompany,
    createCompany,
    updateMyCompany
} from "../../api/companies.js";

import {
    getCurrentUser,
    logoutUser
} from "../../api/auth.js";


// ============================================================
// NAV ITEM
// ============================================================

function NavItem({ icon: Icon, children, active = false, onClick }) {
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
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span>{children}</span>
        </button>
    );
}


// ============================================================
// SIDEBAR CONTENT
// ============================================================

function SidebarContent({
    mobile = false,
    onClose,
    recruiterName,
    onNavigate
}) {
    const initials =
        recruiterName
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "RC";

    return (
        <div className="flex h-full flex-col">

            {/* LOGO */}
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
                        onClick={onClose}
                        aria-label="Close navigation"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>


            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto px-3 py-5">

                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Workspace
                </p>

                <div className="space-y-1">

                    <NavItem
                        icon={LayoutDashboard}
                        onClick={() => onNavigate("/recruiter/dashboard")}
                    >
                        Overview
                    </NavItem>

                    <NavItem
                        icon={Building2}
                        active
                    >
                        Company Profile
                    </NavItem>

                    <NavItem
                        icon={BriefcaseBusiness}
                        onClick={() => onNavigate("/recruiter/jobs")}
                    >
                        Job Postings
                    </NavItem>

                    <NavItem
                        icon={Users}
                        onClick={() => onNavigate("/recruiter/applicants")}
                    >
                        Applicants
                    </NavItem>

                </div>


                <div className="mt-8">

                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Account
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            logoutUser();
                            onNavigate("/login");
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                    >
                        <LogOut className="h-[18px] w-[18px] shrink-0" />
                        Sign out
                    </button>

                </div>
            </nav>


            {/* RECRUITER CARD */}
            <div className="shrink-0 border-t border-slate-200 p-3">

                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                        {initials}
                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-800">
                            {recruiterName || "Recruiter"}
                        </p>

                        <p className="text-xs text-slate-500">
                            Campus Hiring
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}


// ============================================================
// INFORMATION FIELD
// ============================================================

function InfoField({
    label,
    icon: Icon,
    children,
    fullWidth = false
}) {
    return (
        <div className={fullWidth ? "md:col-span-2" : ""}>

            <label className="mb-2 block text-xs font-semibold text-slate-500">
                {label}
            </label>

            <div className="flex min-h-11 w-full min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3">

                {Icon && (
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                )}

                <div className="min-w-0 flex-1 text-sm text-slate-800">
                    {children}
                </div>

            </div>
        </div>
    );
}


// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
    icon: Icon,
    iconClassName,
    title,
    description
}) {
    return (
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        iconClassName || "bg-blue-50"
                    }`}
                >
                    <Icon className="h-4 w-4 text-blue-600" />
                </div>

                <div className="min-w-0">

                    <h3 className="text-sm font-semibold text-slate-900">
                        {title}
                    </h3>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {description}
                    </p>

                </div>

            </div>

        </div>
    );
}


// ============================================================
// STATUS HELPERS
// ============================================================

function getStatusDetails(status) {

    switch (status) {

        case "APPROVED":
            return {
                label: "Approved",
                color: "emerald",
                icon: CheckCircle2
            };

        case "REJECTED":
            return {
                label: "Rejected",
                color: "red",
                icon: XCircle
            };

        case "PENDING_REVIEW":
        default:
            return {
                label: "Pending Review",
                color: "amber",
                icon: Clock3
            };
    }
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function CompanyProfile() {

    const navigate = useNavigate();

    const currentUser = getCurrentUser();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [company, setCompany] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        industry: "",
        website: "",
        location: "",
        employeeCount: "",
        description: ""
    });


    // ========================================================
    // LOAD COMPANY
    // ========================================================

    useEffect(() => {

        const loadCompany = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getMyCompany();

                const fetchedCompany = data.company;

                setCompany(fetchedCompany);

                setFormData({
                    companyName: fetchedCompany.companyName || "",
                    industry: fetchedCompany.industry || "",
                    website: fetchedCompany.website || "",
                    location: fetchedCompany.location || "",
                    employeeCount: fetchedCompany.employeeCount || "",
                    description: fetchedCompany.description || ""
                });

            } catch (err) {

                // A 404 simply means the recruiter has not
                // created a company yet.
                if (
                    err.message === "Company not found"
                ) {
                    setCompany(null);
                    setIsEditing(false);
                } else {
                    setError(
                        err.message ||
                        "Unable to load company profile"
                    );
                }

            } finally {

                setLoading(false);

            }
        };

        loadCompany();

    }, []);


    // ========================================================
    // FORM CHANGE
    // ========================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // ========================================================
    // START CREATE / EDIT
    // ========================================================

    const handleCreate = () => {

        setError("");
        setSuccess("");

        setFormData({
            companyName: "",
            industry: "",
            website: "",
            location: "",
            employeeCount: "",
            description: ""
        });

        setIsEditing(true);

    };


    const handleEdit = () => {

        setError("");
        setSuccess("");

        setFormData({
            companyName: company?.companyName || "",
            industry: company?.industry || "",
            website: company?.website || "",
            location: company?.location || "",
            employeeCount: company?.employeeCount || "",
            description: company?.description || ""
        });

        setIsEditing(true);

    };


    // ========================================================
    // CANCEL EDIT
    // ========================================================

    const handleCancel = () => {

        setError("");
        setSuccess("");

        if (company) {

            setFormData({
                companyName: company.companyName || "",
                industry: company.industry || "",
                website: company.website || "",
                location: company.location || "",
                employeeCount: company.employeeCount || "",
                description: company.description || ""
            });

            setIsEditing(false);

        } else {

            setIsEditing(false);

        }

    };


    // ========================================================
    // SAVE / CREATE
    // ========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        // Basic client-side validation.
        // Backend also validates required fields.

        if (!formData.companyName.trim()) {
            setError("Company name is required.");
            return;
        }

        if (!formData.industry.trim()) {
            setError("Industry is required.");
            return;
        }

        if (!formData.location.trim()) {
            setError("Location is required.");
            return;
        }


        try {

            setSaving(true);

            let response;

            if (company) {

                response = await updateMyCompany({
                    companyName: formData.companyName.trim(),
                    industry: formData.industry.trim(),
                    website: formData.website.trim(),
                    location: formData.location.trim(),
                    employeeCount: formData.employeeCount.trim(),
                    description: formData.description.trim()
                });

            } else {

                response = await createCompany({
                    companyName: formData.companyName.trim(),
                    industry: formData.industry.trim(),
                    website: formData.website.trim(),
                    location: formData.location.trim(),
                    employeeCount: formData.employeeCount.trim(),
                    description: formData.description.trim()
                });

            }


            const savedCompany = response.company;

            setCompany(savedCompany);

            setFormData({
                companyName: savedCompany.companyName || "",
                industry: savedCompany.industry || "",
                website: savedCompany.website || "",
                location: savedCompany.location || "",
                employeeCount: savedCompany.employeeCount || "",
                description: savedCompany.description || ""
            });

            setIsEditing(false);

            setSuccess(
                company
                    ? "Company profile updated successfully."
                    : "Company profile submitted for admin review."
            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to save company profile."
            );

        } finally {

            setSaving(false);

        }

    };


    // ========================================================
    // NAVIGATION
    // ========================================================

    const handleNavigate = (path) => {

        setMobileMenuOpen(false);

        navigate(path);

    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-slate-50">

                <div className="flex min-h-screen items-center justify-center px-4">

                    <div className="text-center">

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                        <p className="mt-3 text-sm text-slate-500">
                            Loading company profile...
                        </p>

                    </div>

                </div>

            </div>
        );

    }


    const statusDetails = company
        ? getStatusDetails(company.approvalStatus)
        : null;

    const StatusIcon = statusDetails?.icon;

    const recruiterName =
        company?.recruiter?.name ||
        currentUser?.name ||
        "Recruiter";

    const recruiterEmail =
        company?.recruiter?.email ||
        currentUser?.email ||
        "Not available";

    const recruiterInitials =
        recruiterName
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "RC";


    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">


            {/* ==================================================
                DESKTOP SIDEBAR
            =================================================== */}

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-slate-200 bg-white lg:flex">

                <SidebarContent
                    recruiterName={recruiterName}
                    onNavigate={handleNavigate}
                />

            </aside>


            {/* ==================================================
                MOBILE SIDEBAR
            =================================================== */}

            {mobileMenuOpen && (

                <div className="fixed inset-0 z-50 lg:hidden">

                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() => setMobileMenuOpen(false)}
                        className="absolute inset-0 bg-slate-900/30"
                    />

                    <aside className="relative h-full w-[280px] max-w-[85vw] bg-white shadow-xl">

                        <SidebarContent
                            mobile
                            onClose={() =>
                                setMobileMenuOpen(false)
                            }
                            recruiterName={recruiterName}
                            onNavigate={handleNavigate}
                        />

                    </aside>

                </div>
            )}


            {/* ==================================================
                MAIN
            =================================================== */}

            <main className="min-h-screen min-w-0 lg:ml-[250px]">


                {/* ==================================================
                    TOP BAR
                =================================================== */}

                <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">

                    <div className="flex min-w-0 items-center gap-3">

                        {/* Mobile menu */}

                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(true)
                            }
                            aria-label="Open navigation"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>


                        {/* Mobile title */}

                        <div className="min-w-0 lg:hidden">

                            <p className="truncate text-sm font-semibold text-slate-900">
                                Company Profile
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                                Company Management
                            </p>

                        </div>


                        {/* Desktop search */}

                        <div className="hidden h-10 w-[310px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">

                            <Search className="h-4 w-4 shrink-0 text-slate-400" />

                            <input
                                type="text"
                                placeholder="Search candidates, jobs..."
                                className="ml-2 w-full min-w-0 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />

                        </div>

                    </div>


                    {/* Recruiter */}

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                        <div className="hidden text-right sm:block">

                            <p className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
                                {recruiterName}
                            </p>

                            <p className="text-[11px] text-slate-500">
                                Recruiter
                            </p>

                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                            {recruiterInitials}
                        </div>

                        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />

                    </div>

                </header>


                {/* ==================================================
                    PAGE CONTENT
                =================================================== */}

                <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">


                    {/* ==================================================
                        PAGE HEADING
                    =================================================== */}

                    <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">

                        <div className="min-w-0">

                            <p className="mb-1 text-sm font-medium text-blue-600">
                                Company Management
                            </p>

                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Company Profile
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-500">
                                Manage the company information used across your campus hiring activities.
                            </p>

                        </div>


                        {/* Edit / Create button */}

                        {company && !isEditing && (

                            <button
                                type="button"
                                onClick={handleEdit}
                                className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Profile
                            </button>

                        )}

                    </div>


                    {/* ==================================================
                        ALERTS
                    =================================================== */}

                    {error && (

                        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">

                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                            <p className="text-sm leading-5 text-red-700">
                                {error}
                            </p>

                        </div>

                    )}


                    {success && (

                        <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">

                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                            <p className="text-sm leading-5 text-emerald-700">
                                {success}
                            </p>

                        </div>

                    )}


                    {/* ==================================================
                        NO COMPANY
                    =================================================== */}

                    {!company && !isEditing && (

                        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-10">

                            <div className="mx-auto max-w-lg text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                                    <Building2 className="h-8 w-8 text-blue-600" />
                                </div>

                                <h2 className="mt-5 text-xl font-bold text-slate-900">
                                    No Company Profile Yet
                                </h2>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Create your company profile to start submitting job postings for campus recruitment.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Company Profile
                                </button>

                            </div>

                        </section>

                    )}


                    {/* ==================================================
                        CREATE / EDIT FORM
                    =================================================== */}

                    {isEditing && (

                        <form onSubmit={handleSubmit}>

                            <section className="mb-5 w-full rounded-xl border border-slate-200 bg-white">

                                <SectionHeader
                                    icon={Building2}
                                    iconClassName="bg-blue-50"
                                    title={
                                        company
                                            ? "Edit Company Information"
                                            : "Create Company Profile"
                                    }
                                    description={
                                        company
                                            ? "Update the company information used for campus recruitment."
                                            : "Enter your company details and submit the profile for Placement Cell review."
                                    }
                                />


                                <div className="grid grid-cols-1 gap-5 p-4 sm:gap-6 sm:p-6 md:grid-cols-2">


                                    {/* Company Name */}

                                    <div>

                                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                                            Company Name
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="e.g. Amazon"
                                            className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    {/* Industry */}

                                    <div>

                                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                                            Industry
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            placeholder="e.g. Technology & E-commerce"
                                            className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    {/* Website */}

                                    <div>

                                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                                            Company Website
                                        </label>

                                        <div className="relative">

                                            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                            <input
                                                type="text"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                placeholder="https://example.com"
                                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* Location */}

                                    <div>

                                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                                            Location
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">

                                            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="e.g. Seattle, Washington"
                                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* Employee Count */}

                                    <div>

                                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                                            Company Size
                                        </label>

                                        <div className="relative">

                                            <UsersRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                            <input
                                                type="text"
                                                name="employeeCount"
                                                value={formData.employeeCount}
                                                onChange={handleChange}
                                                placeholder="e.g. 100,000+ employees"
                                                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>


                                    {/* Description */}

                                    <div className="md:col-span-2">

                                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                                            Company Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Describe your company, business areas, and opportunities for students..."
                                            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                            </section>


                            {/* FORM ACTIONS */}

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="min-h-11 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {saving ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            {company
                                                ? "Save Changes"
                                                : "Submit for Review"}
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    )}


                    {/* ==================================================
                        COMPANY DISPLAY
                    =================================================== */}

                    {company && !isEditing && (

                        <>


                            {/* COMPANY HEADER */}

                            <section className="mb-5 w-full rounded-xl border border-slate-200 bg-white">

                                <div className="p-4 sm:p-6">

                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">


                                        {/* Company Logo */}

                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 sm:h-20 sm:w-20">

                                            <span className="text-2xl font-bold text-orange-600 sm:text-3xl">
                                                {company.companyName
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "C"}
                                            </span>

                                        </div>


                                        {/* Company Identity */}

                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                                                    {company.companyName}
                                                </h2>

                                                {company.approvalStatus === "APPROVED" && (

                                                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">

                                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />

                                                        Verified Company

                                                    </span>

                                                )}

                                            </div>


                                            <p className="mt-1 text-sm text-slate-500">
                                                {company.industry}
                                            </p>


                                            <div className="mt-3 flex flex-col gap-2.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">

                                                {company.website && (

                                                    <a
                                                        href={
                                                            company.website.startsWith("http")
                                                                ? company.website
                                                                : `https://${company.website}`
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex min-w-0 items-center gap-1.5 transition hover:text-blue-600"
                                                    >

                                                        <Globe className="h-3.5 w-3.5 shrink-0" />

                                                        <span className="break-all">
                                                            {company.website}
                                                        </span>

                                                        <ExternalLink className="h-3 w-3 shrink-0" />

                                                    </a>

                                                )}


                                                <span className="flex min-w-0 items-center gap-1.5">

                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />

                                                    <span className="break-words">
                                                        {company.location}
                                                    </span>

                                                </span>

                                            </div>

                                        </div>


                                        {/* Company Status */}

                                        <div className="shrink-0 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0 sm:text-right">

                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                Company Status
                                            </p>

                                            <div className="mt-1 flex items-center gap-1.5 sm:justify-end">

                                                <span
                                                    className={`h-2 w-2 rounded-full ${
                                                        company.approvalStatus === "APPROVED"
                                                            ? "bg-emerald-500"
                                                            : company.approvalStatus === "REJECTED"
                                                                ? "bg-red-500"
                                                                : "bg-amber-500"
                                                    }`}
                                                />

                                                <span
                                                    className={`text-sm font-semibold ${
                                                        company.approvalStatus === "APPROVED"
                                                            ? "text-emerald-700"
                                                            : company.approvalStatus === "REJECTED"
                                                                ? "text-red-700"
                                                                : "text-amber-700"
                                                    }`}
                                                >
                                                    {statusDetails.label}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </section>


                            {/* COMPANY INFORMATION */}

                            <section className="mb-5 w-full rounded-xl border border-slate-200 bg-white">

                                <SectionHeader
                                    icon={Building2}
                                    iconClassName="bg-blue-50"
                                    title="Company Information"
                                    description="Information displayed on your campus hiring postings."
                                />


                                <div className="grid grid-cols-1 gap-5 p-4 sm:gap-6 sm:p-6 md:grid-cols-2">


                                    <InfoField
                                        label="Company Name"
                                        icon={Building2}
                                    >
                                        {company.companyName}
                                    </InfoField>


                                    <InfoField
                                        label="Industry"
                                        icon={BriefcaseBusiness}
                                    >
                                        {company.industry}
                                    </InfoField>


                                    {/* Website */}

                                    <div>

                                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                                            Company Website
                                        </label>

                                        <div className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3">

                                            {company.website ? (

                                                <a
                                                    href={
                                                        company.website.startsWith("http")
                                                            ? company.website
                                                            : `https://${company.website}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex min-w-0 items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                                                >

                                                    <Globe className="h-4 w-4 shrink-0 text-slate-400" />

                                                    <span className="min-w-0 truncate">
                                                        {company.website}
                                                    </span>

                                                </a>

                                            ) : (

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <Globe className="h-4 w-4 shrink-0 text-slate-400" />

                                                    <span className="text-sm text-slate-400">
                                                        Not provided
                                                    </span>

                                                </div>

                                            )}

                                            {company.website && (
                                                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                                            )}

                                        </div>

                                    </div>


                                    <InfoField
                                        label="Company Size"
                                        icon={UsersRound}
                                    >
                                        {company.employeeCount || "Not provided"}
                                    </InfoField>


                                    <InfoField
                                        label="Headquarters / Location"
                                        icon={MapPin}
                                        fullWidth
                                    >
                                        <span className="break-words">
                                            {company.location}
                                        </span>
                                    </InfoField>


                                    {/* Description */}

                                    <div className="md:col-span-2">

                                        <label className="mb-2 block text-xs font-semibold text-slate-500">
                                            Company Description
                                        </label>

                                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">

                                            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {company.description ||
                                                    "No company description provided."}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </section>


                            {/* RECRUITER INFORMATION */}

                            <section className="mb-5 w-full rounded-xl border border-slate-200 bg-white">

                                <SectionHeader
                                    icon={UserRound}
                                    iconClassName="bg-violet-50"
                                    title="Recruiter Information"
                                    description="Your recruiter account information."
                                />


                                <div className="grid grid-cols-1 gap-5 p-4 sm:gap-6 sm:p-6 md:grid-cols-2">


                                    <InfoField
                                        label="Recruiter Name"
                                        icon={UserRound}
                                    >
                                        {recruiterName}
                                    </InfoField>


                                    <InfoField
                                        label="Role"
                                        icon={ShieldCheck}
                                    >
                                        Campus Recruiter
                                    </InfoField>


                                    <InfoField
                                        label="Recruiter Email"
                                        icon={Mail}
                                    >
                                        <span className="break-all">
                                            {recruiterEmail}
                                        </span>
                                    </InfoField>


                                    <InfoField
                                        label="Recruiter Since"
                                        icon={CalendarDays}
                                    >
                                        {company.recruiter?.createdAt
                                            ? new Date(
                                                company.recruiter.createdAt
                                            ).toLocaleDateString(
                                                "en-US",
                                                {
                                                    month: "long",
                                                    year: "numeric"
                                                }
                                            )
                                            : "Account date unavailable"}
                                    </InfoField>

                                </div>

                            </section>


                            {/* ==================================================
                                APPROVAL STATUS
                            =================================================== */}

                            {company.approvalStatus === "APPROVED" && (

                                <section className="w-full rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5">

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                                            <ShieldCheck className="h-5 w-5 text-emerald-600" />

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                <div className="min-w-0">

                                                    <h3 className="text-sm font-semibold text-emerald-900">
                                                        Company approved by Placement Cell
                                                    </h3>

                                                    <p className="mt-1 max-w-3xl text-xs leading-5 text-emerald-700">
                                                        Your company is approved to participate in campus recruitment. Individual job postings will still require Placement Cell approval before becoming visible to students.
                                                    </p>

                                                </div>


                                                <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">

                                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />

                                                    Approved

                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </section>

                            )}


                            {company.approvalStatus === "PENDING_REVIEW" && (

                                <section className="w-full rounded-xl border border-amber-100 bg-amber-50 p-4 sm:p-5">

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                                            <Clock3 className="h-5 w-5 text-amber-600" />

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                <div className="min-w-0">

                                                    <h3 className="text-sm font-semibold text-amber-900">
                                                        Company awaiting Placement Cell review
                                                    </h3>

                                                    <p className="mt-1 max-w-3xl text-xs leading-5 text-amber-700">
                                                        Your company profile has been submitted successfully. It will become available for campus recruitment after Placement Cell approval.
                                                    </p>

                                                </div>


                                                <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-700">

                                                    <Clock3 className="h-3.5 w-3.5 shrink-0" />

                                                    Pending Review

                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </section>

                            )}


                            {company.approvalStatus === "REJECTED" && (

                                <section className="w-full rounded-xl border border-red-100 bg-red-50 p-4 sm:p-5">

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                                            <XCircle className="h-5 w-5 text-red-600" />

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                <div className="min-w-0">

                                                    <h3 className="text-sm font-semibold text-red-900">
                                                        Company profile rejected
                                                    </h3>

                                                    <p className="mt-1 max-w-3xl text-xs leading-5 text-red-700">
                                                        Please review the rejection reason, update your company profile, and submit it again for Placement Cell review.
                                                    </p>


                                                    {company.rejectionReason && (

                                                        <div className="mt-3 rounded-lg border border-red-200 bg-white p-3">

                                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
                                                                Rejection Reason
                                                            </p>

                                                            <p className="mt-1 text-sm leading-5 text-red-800">
                                                                {company.rejectionReason}
                                                            </p>

                                                        </div>

                                                    )}

                                                </div>


                                                <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700">

                                                    <XCircle className="h-3.5 w-3.5 shrink-0" />

                                                    Rejected

                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </section>

                            )}

                        </>

                    )}

                </div>

            </main>

        </div>
    );
}

export default CompanyProfile;