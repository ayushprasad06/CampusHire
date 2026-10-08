import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

// AUTH
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

// STUDENT
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import BrowseJobs from "./pages/student/BrowseJobs.jsx";
import JobDetails from "./pages/student/JobDetails.jsx";
import MyApplications from "./pages/student/MyApplications.jsx";
import MyProfile from "./pages/student/MyProfile.jsx";

// RECRUITER
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard.jsx";
import CompanyProfile from "./pages/recruiter/CompanyProfile.jsx";
import JobPostings from "./pages/recruiter/JobPostings.jsx";
import CreateJobPosting from "./pages/recruiter/CreateJobPosting.jsx";
import RecruiterJobDetails from "./pages/recruiter/JobDetails.jsx";
import Applicants from "./pages/recruiter/Applicants.jsx";
import ApplicantDetails from "./pages/recruiter/ApplicantDetails.jsx";

// ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCompanies from "./pages/admin/AdminCompanies.jsx";
import AdminJobPostings from "./pages/admin/AdminJobPostings.jsx";
import AdminPendingReviews from "./pages/admin/AdminPendingReviews.jsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.jsx";

function App() {
    return (
        <Routes>

            {/* =========================
                AUTH
            ========================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* =========================
                STUDENT
            ========================= */}

            <Route element={
                <ProtectedRoute
                    allowedRoles={["STUDENT"]}
                />
            }>

                <Route
                    path="/student/dashboard"
                    element={<StudentDashboard />}
                />

                <Route
                    path="/student/jobs"
                    element={<BrowseJobs />}
                />

                <Route
                    path="/student/jobs/:id"
                    element={<JobDetails />}
                />

                <Route
                    path="/student/applications"
                    element={<MyApplications />}
                />

                <Route
                    path="/student/profile"
                    element={<MyProfile />}
                />

            </Route>


            {/* =========================
                RECRUITER
            ========================= */}

            <Route element={
                <ProtectedRoute
                    allowedRoles={["RECRUITER"]}
                />
            }>

                <Route
                    path="/recruiter/dashboard"
                    element={<RecruiterDashboard />}
                />

                <Route
                    path="/recruiter/company"
                    element={<CompanyProfile />}
                />

                <Route
                    path="/recruiter/jobs"
                    element={<JobPostings />}
                />

                <Route
                    path="/recruiter/jobs/create"
                    element={<CreateJobPosting />}
                />

                <Route
                    path="/recruiter/jobs/:id"
                    element={<RecruiterJobDetails />}
                />

                <Route
                    path="/recruiter/applicants"
                    element={<Applicants />}
                />

                <Route
                    path="/recruiter/applicants/:id"
                    element={<ApplicantDetails />}
                />

            </Route>


            {/* =========================
                ADMIN
            ========================= */}

            <Route element={
                <ProtectedRoute
                    allowedRoles={["ADMIN"]}
                />
            }>

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/companies"
                    element={<AdminCompanies />}
                />

                <Route
                    path="/admin/jobs"
                    element={<AdminJobPostings />}
                />

                <Route
                    path="/admin/pending-reviews"
                    element={<AdminPendingReviews />}
                />

                <Route
                    path="/admin/audit-logs"
                    element={<AdminAuditLogs />}
                />

            </Route>


            {/* =========================
                DEFAULT
            ========================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default App;