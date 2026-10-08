import express from "express";

import {
    applyForJob,
    getMyApplications,
    getMyApplicationById,
    getRecruiterApplications,
    getRecruiterApplicationById,
    updateApplicationStatus,
    updateApplicationsStatusBatch
} from "../controllers/applicationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// ============================================================
// STUDENT ROUTES
// ============================================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("STUDENT"),
    applyForJob
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("STUDENT"),
    getMyApplications
);

router.get(
    "/my/:id",
    authMiddleware,
    roleMiddleware("STUDENT"),
    getMyApplicationById
);

// ============================================================
// RECRUITER ROUTES
// ============================================================

router.get(
    "/recruiter",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    getRecruiterApplications
);

router.get(
    "/recruiter/:id",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    getRecruiterApplicationById
);

router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    updateApplicationStatus
);

router.patch(
    "/batch-status",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    updateApplicationsStatusBatch
);

export default router;