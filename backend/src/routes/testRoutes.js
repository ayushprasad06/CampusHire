import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/protected",
    authMiddleware,
    (req, res) => {
        res.json({
            message: "You are authenticated",
            user: req.user
        });
    }
);

router.get(
    "/student",
    authMiddleware,
    roleMiddleware("STUDENT"),
    (req, res) => {
        res.json({
            message: "Student access granted"
        });
    }
);

router.get(
    "/recruiter",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    (req, res) => {
        res.json({
            message: "Recruiter access granted"
        });
    }
);

router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => {
        res.json({
            message: "Admin access granted"
        });
    }
);

export default router;