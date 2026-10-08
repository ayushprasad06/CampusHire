import express from "express";
import cors from "cors";
import "dotenv/config";
import morgan from "morgan";

import testRoutes from "./routes/testRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import connectDB from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


// ==========================================
// ROUTES
// ==========================================

app.use(
    "/api/test",
    testRoutes
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/jobs",
    jobRoutes
);

app.use(
    "/api/audit-logs",
    auditLogRoutes
);

app.use(
    "/api/companies",
    companyRoutes
);

app.use(
    "/api/applications",
    applicationRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);


// ==========================================
// ROOT
// ==========================================

app.get(
    "/",
    (req, res) => {
        res.json({
            message:
                "CampusHire Backend is running"
        });
    }
);


// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;

const startServer = async () => {

    await connectDB();

    app.listen(
        PORT,
        () => {
            console.log(
                `Server running on port ${PORT}`
            );
        }
    );

};

startServer();