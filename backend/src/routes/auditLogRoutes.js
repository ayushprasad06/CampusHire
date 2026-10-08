import express from "express";

import {
    getAuditLogs
} from "../controllers/auditLogController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// ==========================================
// ADMIN: GET AUDIT LOGS
// ==========================================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAuditLogs
);

export default router;