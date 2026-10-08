import express from "express";

import {
    createJob,
    getMyJobs,
    getJobById,
    updateJob,
    getAvailableJobs,
    getPendingJobs,
    approveJob,
    rejectJob,
    activateJob,
    closeJob
} from "../controllers/jobController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// ==========================================
// STUDENT
// ==========================================

router.get(
    "/available",
    authMiddleware,
    roleMiddleware("STUDENT"),
    getAvailableJobs
);


// ==========================================
// RECRUITER
// ==========================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    createJob
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    getMyJobs
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    updateJob
);

router.patch(
    "/:id/activate",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    activateJob
);

router.patch(
    "/:id/close",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    closeJob
);


// ==========================================
// ADMIN
// ==========================================

router.get(
    "/pending",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getPendingJobs
);

router.patch(
    "/:id/approve",
    authMiddleware,
    roleMiddleware("ADMIN"),
    approveJob
);

router.patch(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("ADMIN"),
    rejectJob
);


// ==========================================
// COMMON AUTHENTICATED JOB DETAILS
// ==========================================

router.get(
    "/:id",
    authMiddleware,
    getJobById
);

export default router;