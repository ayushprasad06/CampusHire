import express from "express";

import {
    getAdminDashboard,
    getAdminCompanies,
    getAdminJobs,
    getAuditLogs,
    approveCompany,
    rejectCompany,
    approveJob,
    rejectJob
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router =
    express.Router();


// ============================================================
// ADMIN DASHBOARD
// ============================================================

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAdminDashboard
);


// ============================================================
// ADMIN COMPANIES
// ============================================================

router.get(
    "/companies",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAdminCompanies
);


// ============================================================
// ADMIN JOB POSTINGS
// ============================================================

router.get(
    "/jobs",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAdminJobs
);


// ============================================================
// ADMIN AUDIT LOGS
// ============================================================

router.get(
    "/audit-logs",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAuditLogs
);


// ============================================================
// COMPANY APPROVAL
// ============================================================

router.patch(
    "/companies/:id/approve",
    authMiddleware,
    roleMiddleware("ADMIN"),
    approveCompany
);


router.patch(
    "/companies/:id/reject",
    authMiddleware,
    roleMiddleware("ADMIN"),
    rejectCompany
);


// ============================================================
// JOB APPROVAL
// ============================================================

router.patch(
    "/jobs/:id/approve",
    authMiddleware,
    roleMiddleware("ADMIN"),
    approveJob
);


router.patch(
    "/jobs/:id/reject",
    authMiddleware,
    roleMiddleware("ADMIN"),
    rejectJob
);


export default router;