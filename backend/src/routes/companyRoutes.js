import express from "express";

import {
    createCompany,
    getMyCompany,
    updateMyCompany,
    getPendingCompanies,
    approveCompany,
    rejectCompany
} from "../controllers/companyController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// ==========================================
// RECRUITER ROUTES
// ==========================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    createCompany
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    getMyCompany
);

router.put(
    "/my",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    updateMyCompany
);


// ==========================================
// ADMIN ROUTES
// ==========================================

router.get(
    "/pending",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getPendingCompanies
);

router.patch(
    "/:id/approve",
    authMiddleware,
    roleMiddleware("ADMIN"),
    approveCompany
);

router.patch(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("ADMIN"),
    rejectCompany
);

export default router;