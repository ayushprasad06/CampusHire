import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";

import User from "./models/User.js";
import Company from "./models/Company.js";
import Job from "./models/Job.js";
import Application from "./models/Application.js";
import AuditLog from "./models/AuditLog.js";

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("Clearing existing seed data...");

        await AuditLog.deleteMany({});
        await Application.deleteMany({});
        await Job.deleteMany({});
        await Company.deleteMany({});
        await User.deleteMany({});

        console.log("Existing data cleared.");

        // -----------------------------------------
        // Passwords
        // -----------------------------------------

        const studentPassword = await bcrypt.hash(
            "student123",
            10
        );

        const recruiterPassword = await bcrypt.hash(
            "recruiter123",
            10
        );

        const adminPassword = await bcrypt.hash(
            "admin123",
            10
        );

        // -----------------------------------------
        // Users
        // -----------------------------------------

        const student = await User.create({
            name: "Ayush Prasad",
            email: "student@campushire.com",
            password: studentPassword,
            role: "STUDENT",
            department: "BCA",
            cgpa: 9.09,
            graduationYear: 2027,
            resumeLink: "https://example.com/resume/ayush-prasad"
        });

        const recruiter = await User.create({
            name: "Amazon Recruiter",
            email: "recruiter@amazon.com",
            password: recruiterPassword,
            role: "RECRUITER"
        });

        const admin = await User.create({
            name: "Placement Admin",
            email: "admin@campushire.com",
            password: adminPassword,
            role: "ADMIN"
        });

        console.log("Users created.");

        // -----------------------------------------
        // Company
        // -----------------------------------------

        const company = await Company.create({
            companyName: "Amazon",
            industry: "Technology & E-commerce",
            website: "https://www.amazon.jobs",
            location: "Seattle, USA",
            employeeCount: "100,000+",
            description:
                "Global technology and e-commerce company.",
            recruiter: recruiter._id,
            approvalStatus: "APPROVED",
            approvedBy: admin._id,
            approvedAt: new Date()
        });

        console.log("Company created.");

        // -----------------------------------------
        // Job
        // -----------------------------------------

        const job = await Job.create({
            title: "Software Development Engineer",
            description:
                "Software engineering opportunity for students graduating in 2027.",
            company: company._id,
            location: "Bangalore",
            employmentType: "FULL_TIME",
            minimumCGPA: 8.0,
            allowedDepartments: [
                "CSE",
                "IT",
                "BCA"
            ],
            skills: [
                "Java",
                "Data Structures",
                "Algorithms",
                "SQL"
            ],
            graduationYear: 2027,
            applicationDeadline: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
            ),
            status: "ACTIVE",
            createdBy: recruiter._id,
            approvedBy: admin._id,
            approvedAt: new Date()
        });

        console.log("Job created.");

        // -----------------------------------------
        // Application
        // -----------------------------------------

        const application = await Application.create({
            student: student._id,
            job: job._id,
            status: "SHORTLISTED",

            statusHistory: [
                {
                    status: "APPLIED",
                    changedBy: student._id
                },
                {
                    status: "UNDER_REVIEW",
                    changedBy: recruiter._id
                },
                {
                    status: "SHORTLISTED",
                    changedBy: recruiter._id
                }
            ]
        });

        console.log("Application created.");

        // -----------------------------------------
        // Audit Log
        // -----------------------------------------

        await AuditLog.create({
            action: "APPROVED",
            targetType: "COMPANY",
            targetId: company._id,
            description: "Company registration approved",
            reviewerId: admin._id
        });

        await AuditLog.create({
            action: "APPROVED",
            targetType: "JOB",
            targetId: job._id,
            description:
                "Job posting approved for student visibility",
            reviewerId: admin._id
        });

        console.log("Audit logs created.");

        console.log("\n--------------------------------");
        console.log("Database seeded successfully!");
        console.log("--------------------------------\n");

        console.log("Demo credentials:");
        console.log("--------------------------------");
        console.log("Student:");
        console.log("Email: student@campushire.com");
        console.log("Password: student123\n");

        console.log("Recruiter:");
        console.log("Email: recruiter@amazon.com");
        console.log("Password: recruiter123\n");

        console.log("Admin:");
        console.log("Email: admin@campushire.com");
        console.log("Password: admin123");
        console.log("--------------------------------");

        await mongoose.connection.close();

        console.log("\nMongoDB connection closed.");
    } catch (error) {
        console.error("\nSeed failed:");
        console.error(error.message);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedDatabase();