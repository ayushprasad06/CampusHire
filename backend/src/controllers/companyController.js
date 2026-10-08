import Company from "../models/Company.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";


// ==========================================
// CREATE COMPANY
// ==========================================

export const createCompany = async (req, res) => {
    try {
        const {
            companyName,
            industry,
            website,
            location,
            employeeCount,
            description
        } = req.body;

        // Validate required fields
        if (!companyName || !industry || !location) {
            return res.status(400).json({
                message:
                    "Company name, industry and location are required"
            });
        }

        // Check if recruiter already owns a company
        const existingCompany = await Company.findOne({
            recruiter: req.user.userId
        });

        if (existingCompany) {
            return res.status(409).json({
                message:
                    "You already have a company registered"
            });
        }

        const company = await Company.create({
            companyName,
            industry,
            website,
            location,
            employeeCount,
            description,
            recruiter: req.user.userId,
            approvalStatus: "PENDING_REVIEW"
        });

        return res.status(201).json({
            message: "Company submitted for admin review",
            company
        });
    } catch (error) {
        console.error("Create company error:", error);

        return res.status(500).json({
            message: "Server error while creating company"
        });
    }
};


// ==========================================
// GET MY COMPANY
// ==========================================

export const getMyCompany = async (req, res) => {
    try {
        const company = await Company.findOne({
            recruiter: req.user.userId
        }).populate(
            "recruiter",
            "name email role"
        );

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        return res.status(200).json({
            company
        });
    } catch (error) {
        console.error("Get company error:", error);

        return res.status(500).json({
            message: "Server error while fetching company"
        });
    }
};


// ==========================================
// UPDATE MY COMPANY
// ==========================================

export const updateMyCompany = async (req, res) => {
    try {
        const company = await Company.findOne({
            recruiter: req.user.userId
        });

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        const {
            companyName,
            industry,
            website,
            location,
            employeeCount,
            description
        } = req.body;

        if (companyName !== undefined) {
            company.companyName = companyName;
        }

        if (industry !== undefined) {
            company.industry = industry;
        }

        if (website !== undefined) {
            company.website = website;
        }

        if (location !== undefined) {
            company.location = location;
        }

        if (employeeCount !== undefined) {
            company.employeeCount = employeeCount;
        }

        if (description !== undefined) {
            company.description = description;
        }

        // If a previously rejected company is edited,
        // send it back for admin review.
        if (company.approvalStatus === "REJECTED") {
            company.approvalStatus = "PENDING_REVIEW";
            company.approvedBy = null;
            company.approvedAt = null;
            company.rejectionReason = null;
        }

        await company.save();

        return res.status(200).json({
            message: "Company updated successfully",
            company
        });
    } catch (error) {
        console.error("Update company error:", error);

        return res.status(500).json({
            message: "Server error while updating company"
        });
    }
};


// ==========================================
// ADMIN: GET PENDING COMPANIES
// ==========================================

export const getPendingCompanies = async (req, res) => {
    try {
        const companies = await Company.find({
            approvalStatus: "PENDING_REVIEW"
        })
            .populate(
                "recruiter",
                "name email"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            count: companies.length,
            companies
        });
    } catch (error) {
        console.error(
            "Get pending companies error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching pending companies"
        });
    }
};


// ==========================================
// ADMIN: APPROVE COMPANY
// ==========================================

export const approveCompany = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const company =
            await Company.findById(id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        if (
            company.approvalStatus ===
            "APPROVED"
        ) {
            return res.status(400).json({
                message:
                    "Company is already approved"
            });
        }

        company.approvalStatus =
            "APPROVED";

        company.approvedBy =
            req.user.userId;

        company.approvedAt =
            new Date();

        company.rejectionReason = null;

        await company.save();


        // ==================================
        // CREATE AUDIT LOG
        // ==================================

        const reviewer =
            await User.findById(
                req.user.userId
            ).select(
                "name email"
            );

        if (reviewer) {
            await AuditLog.create({
                action: "APPROVED",

                targetType: "Company",

                targetId: company._id,

                targetName:
                    company.companyName,

                description:
                    "Company registration approved",

                reviewer:
                    reviewer._id,

                reviewerId:
                    reviewer._id.toString(),

                reviewerName:
                    reviewer.name,

                reviewerEmail:
                    reviewer.email
            });
        }


        return res.status(200).json({
            message:
                "Company approved successfully",

            company
        });

    } catch (error) {
        console.error(
            "Approve company error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while approving company"
        });
    }
};


// ==========================================
// ADMIN: REJECT COMPANY
// ==========================================

export const rejectCompany = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            rejectionReason
        } = req.body;

        const company =
            await Company.findById(id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        company.approvalStatus =
            "REJECTED";

        company.approvedBy =
            req.user.userId;

        company.approvedAt =
            new Date();

        company.rejectionReason =
            rejectionReason ||
            "Company registration rejected";

        await company.save();


        // ==================================
        // CREATE AUDIT LOG
        // ==================================

        const reviewer =
            await User.findById(
                req.user.userId
            ).select(
                "name email"
            );

        if (reviewer) {
            await AuditLog.create({
                action: "REJECTED",

                targetType: "Company",

                targetId: company._id,

                targetName:
                    company.companyName,

                description:
                    company.rejectionReason,

                reviewer:
                    reviewer._id,

                reviewerId:
                    reviewer._id.toString(),

                reviewerName:
                    reviewer.name,

                reviewerEmail:
                    reviewer.email
            });
        }


        return res.status(200).json({
            message:
                "Company rejected successfully",

            company
        });

    } catch (error) {
        console.error(
            "Reject company error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while rejecting company"
        });
    }
};