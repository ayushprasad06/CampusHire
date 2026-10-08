import { useEffect, useState } from "react";



import {

  LayoutDashboard,

  BriefcaseBusiness,

  FileText,

  UserRound,

  LogOut,

  ChevronDown,

  GraduationCap,

  Search,

  Pencil,

  Mail,

  Phone,

  MapPin,

  BookOpen,

  Award,

  CalendarDays,

  FileText as ResumeIcon,

  ExternalLink,

  CheckCircle2,

  Link as LinkIcon,

  X,

  Save,

  Menu,

} from "lucide-react";



import { useNavigate } from "react-router-dom";



import { getCurrentUser, logoutUser } from "../../api/auth.js";



import { getProfile, updateProfile } from "../../api/users.js";



function MyProfile() {

  const navigate = useNavigate();



  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  const [profile, setProfile] = useState(null);



  const [loading, setLoading] = useState(true);



  const [editing, setEditing] = useState(false);



  const [saving, setSaving] = useState(false);



  const [error, setError] = useState("");



  const [success, setSuccess] = useState("");



  // ==========================================

  // FORM STATE

  // ==========================================



  const [formData, setFormData] = useState({

    name: "",

    phone: "",

    department: "",

    cgpa: "",

    graduationYear: "",

    resumeLink: "",

  });



  // ==========================================

  // LOAD PROFILE

  // ==========================================



  useEffect(() => {

    const loadProfile = async () => {

      try {

        setLoading(true);



        setError("");



        const data = await getProfile();



        setProfile(data.user);



        setFormData({

          name: data.user.name || "",

          phone: data.user.phone || "",

          department: data.user.department || "",

          cgpa:

            data.user.cgpa !== null && data.user.cgpa !== undefined

              ? data.user.cgpa

              : "",

          graduationYear: data.user.graduationYear || "",

          resumeLink: data.user.resumeLink || "",

        });

      } catch (err) {

        setError(err.message || "Unable to load your profile");

      } finally {

        setLoading(false);

      }

    };



    loadProfile();

  }, []);



  // ==========================================

  // HANDLE FORM CHANGE

  // ==========================================



  const handleChange = (e) => {

    const { name, value } = e.target;



    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };



  // ==========================================

  // START EDITING

  // ==========================================



  const handleEdit = () => {

    setError("");



    setSuccess("");



    setFormData({

      name: profile?.name || "",

      phone: profile?.phone || "",

      department: profile?.department || "",

      cgpa:

        profile?.cgpa !== null && profile?.cgpa !== undefined

          ? profile.cgpa

          : "",

      graduationYear: profile?.graduationYear || "",

      resumeLink: profile?.resumeLink || "",

    });



    setEditing(true);

  };



  // ==========================================

  // CANCEL EDIT

  // ==========================================



  const handleCancel = () => {

    setError("");



    setSuccess("");



    setFormData({

      name: profile?.name || "",

      phone: profile?.phone || "",

      department: profile?.department || "",

      cgpa:

        profile?.cgpa !== null && profile?.cgpa !== undefined

          ? profile.cgpa

          : "",

      graduationYear: profile?.graduationYear || "",

      resumeLink: profile?.resumeLink || "",

    });



    setEditing(false);

  };



  // ==========================================

  // SAVE PROFILE

  // ==========================================



  const handleSave = async () => {

    try {

      setSaving(true);



      setError("");



      setSuccess("");



      const data = await updateProfile({

        name: formData.name,

        phone: formData.phone,

        department: formData.department,

        cgpa: formData.cgpa,

        graduationYear: formData.graduationYear,

        resumeLink: formData.resumeLink,

      });



      setProfile(data.user);



      setFormData({

        name: data.user.name || "",

        phone: data.user.phone || "",

        department: data.user.department || "",

        cgpa:

          data.user.cgpa !== null && data.user.cgpa !== undefined

            ? data.user.cgpa

            : "",

        graduationYear: data.user.graduationYear || "",

        resumeLink: data.user.resumeLink || "",

      });



      // ==========================================

      // UPDATE STORED USER INFORMATION

      // ==========================================



      const storedUser = getCurrentUser();



      if (storedUser) {

        localStorage.setItem(

          "campushire_user",

          JSON.stringify({

            ...storedUser,

            ...data.user,

          }),

        );

      }



      setEditing(false);



      setSuccess("Profile updated successfully.");

    } catch (err) {

      setError(err.message || "Unable to update your profile");

    } finally {

      setSaving(false);

    }

  };



  // ==========================================

  // LOGOUT

  // ==========================================



  const handleLogout = () => {

    logoutUser();



    navigate("/login");

  };



  // ==========================================

  // PROFILE COMPLETION

  // ==========================================



  const getCompletion = () => {

    if (!profile) {

      return 0;

    }



    const fields = [

      profile.name,

      profile.phone,

      profile.department,

      profile.cgpa,

      profile.graduationYear,

      profile.resumeLink,

    ];



    const completed = fields.filter(

      (value) => value !== null && value !== undefined && value !== "",

    ).length;



    return Math.round((completed / fields.length) * 100);

  };



  const completion = getCompletion();



  // ==========================================

  // LOADING

  // ==========================================



  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />



          <p className="text-sm text-slate-500 mt-4">Loading profile...</p>

        </div>

      </div>

    );

  }



  // ==========================================

  // PROFILE NOT FOUND

  // ==========================================



  if (!profile) {

    return (

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full text-center">

          <h2 className="text-lg font-bold text-slate-900">

            Unable to load profile

          </h2>



          <p className="text-sm text-slate-500 mt-2">

            {error || "Something went wrong while loading your profile."}

          </p>



          <button

            onClick={() => navigate("/student/dashboard")}

            className="mt-5 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"

          >

            Back to Dashboard

          </button>

        </div>

      </div>

    );

  }



  // ==========================================

  // INITIALS

  // ==========================================



  const initials = profile.name

    ? profile.name

        .split(" ")

        .map((word) => word[0])

        .join("")

        .slice(0, 2)

        .toUpperCase()

    : "ST";



  return (

    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">

      {/* =========================================================

                SIDEBAR

            ========================================================= */}



      {mobileMenuOpen && (

        <button

          type="button"

          aria-label="Close navigation"

          onClick={() => setMobileMenuOpen(false)}

          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"

        />

      )}



      <aside

        className={`fixed left-0 top-0 bottom-0 z-40 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${

          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"

        } lg:translate-x-0`}

      >

        {/* Logo */}



        <div className="h-[76px] px-5 sm:px-6 flex items-center justify-start border-b border-slate-100">

          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">

            <GraduationCap className="w-5 h-5 text-white" />

          </div>



          <div className="ml-3">

            <h1 className="text-lg font-bold text-slate-900">CampusHire</h1>



            <p className="text-[11px] text-slate-400">Student Portal</p>

          </div>



          <button

            type="button"

            onClick={() => setMobileMenuOpen(false)}

            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"

            aria-label="Close navigation"

          >

            <X className="h-5 w-5" />

          </button>

        </div>



        {/* Navigation */}



        <nav className="flex-1 px-4 py-6">

          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">

            Workspace

          </p>



          <div className="space-y-1">

            <button

              onClick={() => {

                setMobileMenuOpen(false);

                navigate("/student/dashboard");

              }}

              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm"

            >

              <LayoutDashboard className="w-[18px] h-[18px]" />

              Overview

            </button>



            <button

              onClick={() => {

                setMobileMenuOpen(false);

                navigate("/student/jobs");

              }}

              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm"

            >

              <BriefcaseBusiness className="w-[18px] h-[18px]" />

              Browse Jobs

            </button>



            <button

              onClick={() => {

                setMobileMenuOpen(false);

                navigate("/student/applications");

              }}

              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm"

            >

              <FileText className="w-[18px] h-[18px]" />

              My Applications

            </button>



            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm">

              <UserRound className="w-[18px] h-[18px]" />

              My Profile

            </button>

          </div>



          {/* Account */}



          <div className="mt-10">

            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">

              Account

            </p>



            <button

              onClick={handleLogout}

              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-red-600 transition text-sm"

            >

              <LogOut className="w-[18px] h-[18px]" />

              Sign out

            </button>

          </div>

        </nav>



        {/* User Card */}



        <div className="p-4 border-t border-slate-100">

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">

            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">

              {initials}

            </div>



            <div className="min-w-0">

              <p className="text-sm font-semibold text-slate-800 truncate">

                {profile.name}

              </p>



              <p className="text-[11px] text-slate-500">

                {profile.department || "Student"} ·{" "}

                {profile.cgpa ? `${profile.cgpa} CGPA` : "CGPA not set"}

              </p>

            </div>

          </div>

        </div>

      </aside>



      {/* =========================================================

                MAIN

            ========================================================= */}



      <main className="lg:ml-[250px] flex-1 min-h-screen min-w-0">

        {/* TOP BAR */}



        <header className="h-[76px] bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="lg:hidden flex items-center gap-2">

              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>

              <span className="font-bold text-slate-900">
                CampusHire
              </span>

            </div>

            <div className="hidden md:flex items-center w-[310px] h-10 rounded-lg bg-slate-50 border border-slate-200 px-3">

              <Search className="w-4 h-4 text-slate-400" />

              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="bg-transparent outline-none border-none ml-2 w-full text-sm text-slate-700 placeholder:text-slate-400"
              />

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right">

              <p className="text-sm font-semibold text-slate-800">
                {profile.name}
              </p>

              <p className="text-[11px] text-slate-500">
                Student
              </p>

            </div>

            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
              {initials}
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400" />

          </div>

        </header>



        {/* PAGE CONTENT */}



        <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">

          {/* PAGE HEADING */}



          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">

            <div>

              <p className="text-sm font-medium text-blue-600 mb-1">

                Student Workspace

              </p>



              <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>



              <p className="text-sm text-slate-500 mt-2">

                Keep your academic and professional information up to date.

              </p>

            </div>



            {!editing ? (

              <button

                onClick={handleEdit}

                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"

              >

                <Pencil className="w-4 h-4" />

                Edit Profile

              </button>

            ) : (

              <div className="flex gap-2">

                <button

                  onClick={handleCancel}

                  disabled={saving}

                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50"

                >

                  <X className="w-4 h-4" />

                  Cancel

                </button>



                <button

                  onClick={handleSave}

                  disabled={saving}

                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"

                >

                  <Save className="w-4 h-4" />



                  {saving ? "Saving..." : "Save Profile"}

                </button>

              </div>

            )}

          </div>



          {/* ERROR */}



          {error && (

            <div className="mb-5 bg-red-50 border border-red-100 rounded-xl p-4">

              <p className="text-sm text-red-700 font-medium">{error}</p>

            </div>

          )}



          {/* SUCCESS */}



          {success && (

            <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4">

              <p className="text-sm text-emerald-700 font-medium">{success}</p>

            </div>

          )}



          {/* =====================================================

                        PROFILE HEADER

                    ===================================================== */}



          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">

                {initials}

              </div>



              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-xl font-bold text-slate-900">

                    {profile.name}

                  </h2>



                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold">

                    Student

                  </span>

                </div>



                <p className="text-sm text-slate-500 mt-1">

                  Bachelor of Computer Applications

                </p>



                <div className="flex flex-wrap items-center gap-4 mt-3">

                  <span className="flex items-center gap-1.5 text-xs text-slate-500">

                    <Mail className="w-3.5 h-3.5" />



                    {profile.email}

                  </span>



                  <span className="flex items-center gap-1.5 text-xs text-slate-500">

                    <MapPin className="w-3.5 h-3.5" />

                    VIT Vellore

                  </span>

                </div>

              </div>

            </div>

          </div>



          {/* =====================================================

                        PROFILE COMPLETION

                    ===================================================== */}



          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">

            <div className="flex items-center justify-between mb-3">

              <div>

                <h3 className="text-sm font-semibold text-slate-900">

                  Profile Completion

                </h3>



                <p className="text-xs text-slate-500 mt-1">

                  A complete profile improves your chances of being considered.

                </p>

              </div>



              <span className="text-sm font-bold text-blue-600">

                {completion}%

              </span>

            </div>



            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">

              <div

                className="h-full bg-blue-600 rounded-full transition-all"

                style={{

                  width: `${completion}%`,

                }}

              />

            </div>



            <div className="flex flex-wrap gap-3 mt-4">

              <span

                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${

                  profile.name && profile.phone

                    ? "bg-emerald-50 text-emerald-700"

                    : "bg-amber-50 text-amber-700"

                }`}

              >

                <CheckCircle2 className="w-3.5 h-3.5" />

                Personal information

              </span>



              <span

                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${

                  profile.department &&

                  profile.cgpa !== null &&

                  profile.cgpa !== undefined &&

                  profile.graduationYear

                    ? "bg-emerald-50 text-emerald-700"

                    : "bg-amber-50 text-amber-700"

                }`}

              >

                <CheckCircle2 className="w-3.5 h-3.5" />

                Academic information

              </span>



              <span

                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${

                  profile.resumeLink

                    ? "bg-emerald-50 text-emerald-700"

                    : "bg-amber-50 text-amber-700"

                }`}

              >

                <CheckCircle2 className="w-3.5 h-3.5" />

                Resume

              </span>

            </div>

          </div>



          {/* =====================================================

                        PERSONAL INFORMATION

                    ===================================================== */}



          <div className="bg-white border border-slate-200 rounded-xl mb-5">

            <div className="px-6 py-5 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">

                  <UserRound className="w-4 h-4 text-blue-600" />

                </div>



                <div>

                  <h3 className="text-sm font-semibold text-slate-900">

                    Personal Information

                  </h3>



                  <p className="text-xs text-slate-500 mt-0.5">

                    Your basic contact information.

                  </p>

                </div>

              </div>

            </div>



            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* FULL NAME */}



              <div>

                <label className="block text-xs font-semibold text-slate-500 mb-2">

                  Full Name

                </label>



                {editing ? (

                  <input

                    type="text"

                    name="name"

                    value={formData.name}

                    onChange={handleChange}

                    className="w-full h-11 px-3 rounded-lg bg-white border border-slate-200 outline-none text-sm text-slate-800 focus:border-blue-400"

                  />

                ) : (

                  <div className="flex items-center gap-3 h-11 px-3 rounded-lg bg-slate-50 border border-slate-200">

                    <UserRound className="w-4 h-4 text-slate-400" />



                    <span className="text-sm text-slate-800">

                      {profile.name}

                    </span>

                  </div>

                )}

              </div>



              {/* EMAIL */}



              <div>

                <label className="block text-xs font-semibold text-slate-500 mb-2">

                  Email Address

                </label>



                <div className="flex items-center gap-3 h-11 px-3 rounded-lg bg-slate-50 border border-slate-200">

                  <Mail className="w-4 h-4 text-slate-400" />



                  <span className="text-sm text-slate-800 truncate">

                    {profile.email}

                  </span>

                </div>

              </div>



              {/* PHONE */}



              <div>

                <label className="block text-xs font-semibold text-slate-500 mb-2">

                  Phone Number

                </label>



                {editing ? (

                  <div className="flex items-center gap-3 h-11 px-3 rounded-lg bg-white border border-slate-200 focus-within:border-blue-400">

                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />



                    <input

                      type="tel"

                      name="phone"

                      value={formData.phone}

                      onChange={handleChange}

                      placeholder="+91 98765 43210"

                      className="w-full outline-none text-sm text-slate-800 bg-transparent"

                    />

                  </div>

                ) : (

                  <div className="flex items-center gap-3 h-11 px-3 rounded-lg bg-slate-50 border border-slate-200">

                    <Phone className="w-4 h-4 text-slate-400" />



                    <span

                      className={`text-sm ${

                        profile.phone ? "text-slate-800" : "text-slate-500"

                      }`}

                    >

                      {profile.phone || "Not provided"}

                    </span>

                  </div>

                )}

              </div>



              {/* INSTITUTION */}



              <div>

                <label className="block text-xs font-semibold text-slate-500 mb-2">

                  Institution

                </label>



                <div className="flex items-center gap-3 h-11 px-3 rounded-lg bg-slate-50 border border-slate-200">

                  <GraduationCap className="w-4 h-4 text-slate-400" />



                  <span className="text-sm text-slate-800">VIT Vellore</span>

                </div>

              </div>

            </div>

          </div>



          {/* =====================================================

                        ACADEMIC INFORMATION

                    ===================================================== */}



          <div className="bg-white border border-slate-200 rounded-xl mb-5">

            <div className="px-6 py-5 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">

                  <BookOpen className="w-4 h-4 text-violet-600" />

                </div>



                <div>

                  <h3 className="text-sm font-semibold text-slate-900">

                    Academic Information

                  </h3>



                  <p className="text-xs text-slate-500 mt-0.5">

                    Academic details used for job eligibility checks.

                  </p>

                </div>

              </div>

            </div>



            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* DEPARTMENT */}



              <div>

                <label className="block text-xs font-semibold text-slate-500 mb-2">

                  Department / Branch

                </label>



                {editing ? (

                  <input

                    type="text"

                    name="department"

                    value={formData.department}

                    onChange={handleChange}

                    placeholder="e.g. Computer Applications"

                    className="w-full h-11 px-3 rounded-lg bg-white border border-slate-200 outline-none text-sm text-slate-800 focus:border-blue-400"

                  />

                ) : (

                  <div className="flex items-center gap-3 h-11 px-3 rounded-lg bg-slate-50 border border-slate-200">

                    <BookOpen className="w-4 h-4 text-slate-400" />



                    <span className="text-sm text-slate-800">

                      {profile.department || "Not set"}

                    </span>

                  </div>

                )}

              </div>



              {/* CGPA */}



              <div>

                <label className="block text-xs font-semibold text-slate-500 mb-2">

                  Current CGPA

                </label>



                {editing ? (

                  <input

                    type="number"

                    name="cgpa"

                    value={formData.cgpa}

                    onChange={handleChange}

                    min="0"

                    max="10"

                    step="0.01"

                    placeholder="e.g. 9.09"

                    className="w-full h-11 px-3 rounded-lg bg-white border border-slate-200 outline-none text-sm text-slate-800 focus:border-blue-400"

                  />

                ) : (

                  <div className="flex items-center gap-3 h-11 px-3 rounded-lg bg-slate-50 border border-slate-200">

                    <Award className="w-4 h-4 text-slate-400" />



                    <span className="text-sm font-semibold text-slate-900">

                      {profile.cgpa ?? "Not set"}

                    </span>

                  </div>

                )}

              </div>



              {/* GRADUATION YEAR */}



              <div>

                <label className="block text-xs font-semibold text-slate-500 mb-2">

                  Graduation Year

                </label>



                {editing ? (

                  <input

                    type="number"

                    name="graduationYear"

                    value={formData.graduationYear}

                    onChange={handleChange}

                    placeholder="e.g. 2027"

                    className="w-full h-11 px-3 rounded-lg bg-white border border-slate-200 outline-none text-sm text-slate-800 focus:border-blue-400"

                  />

                ) : (

                  <div className="flex items-center gap-3 h-11 px-3 rounded-lg bg-slate-50 border border-slate-200">

                    <CalendarDays className="w-4 h-4 text-slate-400" />



                    <span className="text-sm text-slate-800">

                      {profile.graduationYear || "Not set"}

                    </span>

                  </div>

                )}

              </div>

            </div>

          </div>



          {/* =====================================================

                        RESUME

                    ===================================================== */}



          <div className="bg-white border border-slate-200 rounded-xl mb-5">

            <div className="px-6 py-5 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">

                  <ResumeIcon className="w-4 h-4 text-amber-600" />

                </div>



                <div>

                  <h3 className="text-sm font-semibold text-slate-900">

                    Resume

                  </h3>



                  <p className="text-xs text-slate-500 mt-0.5">

                    Keep your latest resume accessible to recruiters.

                  </p>

                </div>

              </div>

            </div>



            <div className="p-6">

              {editing ? (

                <div>

                  <label className="block text-xs font-semibold text-slate-500 mb-2">

                    Resume Link

                  </label>



                  <div className="flex items-center gap-3">

                    <div className="flex-1 flex items-center gap-3 h-11 px-3 rounded-lg bg-white border border-slate-200">

                      <LinkIcon className="w-4 h-4 text-slate-400" />



                      <input

                        type="url"

                        name="resumeLink"

                        value={formData.resumeLink}

                        onChange={handleChange}

                        placeholder="https\://..."

                        className="w-full outline-none text-sm text-slate-800"

                      />

                    </div>

                  </div>



                  <p className="text-xs text-slate-400 mt-2">

                    Add a publicly accessible link to your resume.

                  </p>

                </div>

              ) : (

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">

                      <ResumeIcon className="w-4 h-4 text-blue-600" />

                    </div>



                    <div>

                      <p className="text-sm font-semibold text-slate-800">

                        {profile.resumeLink ? "Resume" : "No resume link added"}

                      </p>



                      <p className="text-xs text-slate-400 mt-1">

                        {profile.resumeLink

                          ? "Resume link available"

                          : "Add your resume link from Edit Profile"}

                      </p>

                    </div>

                  </div>



                  <div className="flex items-center gap-2">

                    {profile.resumeLink && (

                      <a

                        href={profile.resumeLink}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"

                      >

                        <ExternalLink className="w-3.5 h-3.5" />

                        View Resume

                      </a>

                    )}



                    <button

                      onClick={handleEdit}

                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"

                    >

                      <LinkIcon className="w-3.5 h-3.5" />

                      Update Link

                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>



          {/* =====================================================

                        ELIGIBILITY INFORMATION

                    ===================================================== */}



          <div

            className={`${

              completion === 100

                ? "bg-emerald-50 border-emerald-100"

                : "bg-amber-50 border-amber-100"

            } border rounded-xl p-5`}

          >

            <div className="flex items-start gap-3">

              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">

                <CheckCircle2

                  className={`w-5 h-5 ${

                    completion === 100 ? "text-emerald-600" : "text-amber-600"

                  }`}

                />

              </div>



              <div>

                <h3

                  className={`text-sm font-semibold ${

                    completion === 100 ? "text-emerald-900" : "text-amber-900"

                  }`}

                >

                  {completion === 100

                    ? "Profile ready for applications"

                    : "Complete your profile before applying"}

                </h3>



                <p

                  className={`text-xs leading-5 mt-1 ${

                    completion === 100 ? "text-emerald-700" : "text-amber-700"

                  }`}

                >

                  Your academic information will be automatically checked

                  against the eligibility criteria of each approved job posting

                  before you can submit an application.

                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}



export default MyProfile;
