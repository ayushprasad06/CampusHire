import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    getProfile,
    updateProfile
} from "../controllers/userController.js";

const router = express.Router();


// ==========================================
// GET CURRENT USER PROFILE
// GET /api/users/profile
// ==========================================

router.get(
    "/profile",
    authMiddleware,
    getProfile
);


// ==========================================
// UPDATE CURRENT USER PROFILE
// PUT /api/users/profile
// ==========================================

router.put(
    "/profile",
    authMiddleware,
    updateProfile
);


export default router;