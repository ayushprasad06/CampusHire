import Job from "../models/Job.js";
import Company from "../models/Company.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";

// ==========================================
// CREATE JOB
// ==========================================

export const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            companyId,
            location,
            employmentType,
            minimumCGPA,
            allowedDepartments,
            graduationYear,
            skills,
            applicationDeadline
        } = req.body;

        // ------------------------------------------
        // Validate required fields
        // ------------------------------------------

        if (
            !title ||
            !description ||
            !companyId ||
            !location ||
            !employmentType ||
            minimumCGPA === undefined ||
            !allowedDepartments ||
            !graduationYear ||
            !applicationDeadline
        ) {
            return res.status(400).json({
                message:
                    "All job and eligibility fields are required"
            });
        }

        // ------------------------------------------
        // Validate CGPA
        // ------------------------------------------

        if (
            minimumCGPA < 0 ||
            minimumCGPA > 10
        ) {
            return res.status(400).json({
                message:
                    "Minimum CGPA must be between 0 and 10"
            });
        }

        // ------------------------------------------
        // Validate departments
        // ------------------------------------------

        if (
            !Array.isArray(allowedDepartments) ||
            allowedDepartments.length === 0
        ) {
            return res.status(400).json({
                message:
                    "At least one allowed department is required"
            });
        }

        // ------------------------------------------
        // Validate application deadline
        // ------------------------------------------

        const parsedDeadline =
            new Date(applicationDeadline);

        if (
            Number.isNaN(
                parsedDeadline.getTime()
            ) ||
            parsedDeadline <= new Date()
        ) {
            return res.status(400).json({
                message:
                    "Application deadline must be a valid future date"
            });
        }

        // ------------------------------------------
        // Validate skills
        // ------------------------------------------

        if (
            skills !== undefined &&
            !Array.isArray(skills)
        ) {
            return res.status(400).json({
                message:
                    "Skills must be provided as an array"
            });
        }

        const cleanedSkills =
            Array.isArray(skills)
                ? [
                      ...new Set(
                          skills
                              .map((skill) =>
                                  String(skill).trim()
                              )
                              .filter(
                                  (skill) =>
                                      skill.length > 0
                              )
                      )
                  ]
                : [];

        // ------------------------------------------
        // Find company
        // ------------------------------------------

        const company =
            await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        // ------------------------------------------
        // Make sure recruiter owns company
        // ------------------------------------------

        if (
            company.recruiter.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "You can only create jobs for your own company"
            });
        }

        // ------------------------------------------
        // Company must be approved
        // ------------------------------------------

        if (
            company.approvalStatus !==
            "APPROVED"
        ) {
            return res.status(400).json({
                message:
                    "Your company must be approved before creating job postings"
            });
        }

        // ------------------------------------------
        // Create job
        // ------------------------------------------

        const job = await Job.create({
            title,
            description,
            company: company._id,
            location,
            employmentType,
            minimumCGPA,
            allowedDepartments,
            graduationYear,
            skills: cleanedSkills,
            applicationDeadline:
                parsedDeadline,
            status: "PENDING_REVIEW",
            createdBy: req.user.userId
        });

        const populatedJob =
            await Job.findById(job._id)
                .populate(
                    "company",
                    "companyName industry location website"
                );

        return res.status(201).json({
            message:
                "Job submitted for admin review",
            job: populatedJob
        });
    } catch (error) {
        console.error(
            "Create job error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while creating job"
        });
    }
};

// ==========================================
// GET MY JOBS
// ==========================================

export const getMyJobs = async (
    req,
    res
) => {
    try {
        const jobs = await Job.find({
            createdBy: req.user.userId
        })
            .populate(
                "company",
                "companyName industry location"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            count: jobs.length,
            jobs
        });
    } catch (error) {
        console.error(
            "Get my jobs error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching jobs"
        });
    }
};

// ==========================================
// GET JOB BY ID
// ==========================================

export const getJobById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const job =
            await Job.findById(id)
                .populate(
                    "company",
                    "companyName industry website location employeeCount"
                )
                .populate(
                    "createdBy",
                    "name email"
                );

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        return res.status(200).json({
            job
        });
    } catch (error) {
        console.error(
            "Get job error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching job"
        });
    }
};

// ==========================================
// UPDATE MY JOB
// ==========================================

export const updateJob = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const job =
            await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // ------------------------------------------
        // Only creator can update
        // ------------------------------------------

        if (
            job.createdBy.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "You can only update your own job postings"
            });
        }

        // ------------------------------------------
        // Closed jobs cannot be edited
        // ------------------------------------------

        if (
            job.status === "CLOSED"
        ) {
            return res.status(400).json({
                message:
                    "Closed job postings cannot be edited"
            });
        }

        const {
            title,
            description,
            location,
            employmentType,
            minimumCGPA,
            allowedDepartments,
            graduationYear,
            skills,
            applicationDeadline
        } = req.body;

        // ------------------------------------------
        // Update title
        // ------------------------------------------

        if (
            title !== undefined
        ) {
            job.title = title;
        }

        // ------------------------------------------
        // Update description
        // ------------------------------------------

        if (
            description !== undefined
        ) {
            job.description =
                description;
        }

        // ------------------------------------------
        // Update location
        // ------------------------------------------

        if (
            location !== undefined
        ) {
            job.location =
                location;
        }

        // ------------------------------------------
        // Update employment type
        // ------------------------------------------

        if (
            employmentType !== undefined
        ) {
            job.employmentType =
                employmentType;
        }

        // ------------------------------------------
        // Update minimum CGPA
        // ------------------------------------------

        if (
            minimumCGPA !== undefined
        ) {
            if (
                minimumCGPA < 0 ||
                minimumCGPA > 10
            ) {
                return res.status(400).json({
                    message:
                        "Minimum CGPA must be between 0 and 10"
                });
            }

            job.minimumCGPA =
                minimumCGPA;
        }

        // ------------------------------------------
        // Update departments
        // ------------------------------------------

        if (
            allowedDepartments !==
            undefined
        ) {
            if (
                !Array.isArray(
                    allowedDepartments
                ) ||
                allowedDepartments.length === 0
            ) {
                return res.status(400).json({
                    message:
                        "At least one allowed department is required"
                });
            }

            job.allowedDepartments =
                allowedDepartments;
        }

        // ------------------------------------------
        // Update graduation year
        // ------------------------------------------

        if (
            graduationYear !==
            undefined
        ) {
            job.graduationYear =
                graduationYear;
        }

        // ------------------------------------------
        // Update skills
        // ------------------------------------------

        if (
            skills !== undefined
        ) {
            if (
                !Array.isArray(skills)
            ) {
                return res.status(400).json({
                    message:
                        "Skills must be provided as an array"
                });
            }

            job.skills = [
                ...new Set(
                    skills
                        .map((skill) =>
                            String(
                                skill
                            ).trim()
                        )
                        .filter(
                            (skill) =>
                                skill.length >
                                0
                        )
                )
            ];
        }

        // ------------------------------------------
        // Update application deadline
        // ------------------------------------------

        if (
            applicationDeadline !==
            undefined
        ) {
            const parsedDeadline =
                new Date(
                    applicationDeadline
                );

            if (
                Number.isNaN(
                    parsedDeadline.getTime()
                ) ||
                parsedDeadline <=
                    new Date()
            ) {
                return res.status(400).json({
                    message:
                        "Application deadline must be a valid future date"
                });
            }

            job.applicationDeadline =
                parsedDeadline;
        }

        // ------------------------------------------
        // Re-submit rejected job
        // ------------------------------------------

        if (
            job.status ===
            "REJECTED"
        ) {
            if (
                !job.applicationDeadline
            ) {
                return res.status(400).json({
                    message:
                        "Application deadline is required before resubmitting this job"
                });
            }

            job.status =
                "PENDING_REVIEW";

            job.approvedBy = null;
            job.approvedAt = null;
            job.rejectionReason = null;
        }

        await job.save();

        return res.status(200).json({
            message:
                "Job updated successfully",
            job
        });
    } catch (error) {
        console.error(
            "Update job error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while updating job"
        });
    }
};

// ==========================================
// STUDENT: GET AVAILABLE JOBS
// ==========================================

export const getAvailableJobs = async (
    req,
    res
) => {
    try {
        const jobs =
            await Job.find({
                status: "ACTIVE",
                applicationDeadline: {
                    $gt: new Date()
                }
            })
                .populate(
                    "company",
                    "companyName industry website location employeeCount"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            count: jobs.length,
            jobs
        });
    } catch (error) {
        console.error(
            "Get available jobs error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching available jobs"
        });
    }
};

// ==========================================
// ADMIN: GET PENDING JOBS
// ==========================================

export const getPendingJobs = async (
    req,
    res
) => {
    try {
        const jobs =
            await Job.find({
                status:
                    "PENDING_REVIEW"
            })
                .populate(
                    "company",
                    "companyName industry location"
                )
                .populate(
                    "createdBy",
                    "name email"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            count: jobs.length,
            jobs
        });
    } catch (error) {
        console.error(
            "Get pending jobs error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching pending jobs"
        });
    }
};

// ==========================================
// ADMIN: APPROVE JOB
// ==========================================

export const approveJob = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const job =
            await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (
            job.status !==
            "PENDING_REVIEW"
        ) {
            return res.status(400).json({
                message:
                    "Only pending jobs can be approved"
            });
        }

        job.status = "APPROVED";

        job.approvedBy =
            req.user.userId;

        job.approvedAt =
            new Date();

        job.rejectionReason = null;

        await job.save();


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

                targetType:
                    "Job Posting",

                targetId: job._id,

                targetName:
                    job.title,

                description:
                    "Job posting approved for student visibility",

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
                "Job approved successfully",

            job
        });

    } catch (error) {
        console.error(
            "Approve job error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while approving job"
        });
    }
};

// ==========================================
// ADMIN: REJECT JOB
// ==========================================

export const rejectJob = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            rejectionReason
        } = req.body;

        const job =
            await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (
            job.status !==
            "PENDING_REVIEW"
        ) {
            return res.status(400).json({
                message:
                    "Only pending jobs can be rejected"
            });
        }

        job.status = "REJECTED";

        job.approvedBy =
            req.user.userId;

        job.approvedAt =
            new Date();

        job.rejectionReason =
            rejectionReason ||
            "Job posting rejected";

        await job.save();


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

                targetType:
                    "Job Posting",

                targetId: job._id,

                targetName:
                    job.title,

                description:
                    job.rejectionReason,

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
                "Job rejected successfully",

            job
        });

    } catch (error) {
        console.error(
            "Reject job error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while rejecting job"
        });
    }
};

// ==========================================
// RECRUITER: ACTIVATE JOB
// ==========================================

export const activateJob = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const job =
            await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                message:
                    "Job not found"
            });
        }

        if (
            job.createdBy.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "You can only manage your own job postings"
            });
        }

        if (
            job.status !==
            "APPROVED"
        ) {
            return res.status(400).json({
                message:
                    "Only approved jobs can be activated"
            });
        }

        if (
            !job.applicationDeadline ||
            new Date(
                job.applicationDeadline
            ) <= new Date()
        ) {
            return res.status(400).json({
                message:
                    "A valid future application deadline is required before activating this job"
            });
        }

        job.status =
            "ACTIVE";

        await job.save();

        return res.status(200).json({
            message:
                "Job activated successfully",
            job
        });
    } catch (error) {
        console.error(
            "Activate job error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while activating job"
        });
    }
};

// ==========================================
// RECRUITER: CLOSE JOB
// ==========================================

export const closeJob = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const job =
            await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                message:
                    "Job not found"
            });
        }

        if (
            job.createdBy.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "You can only manage your own job postings"
            });
        }

        if (
            job.status !==
            "ACTIVE"
        ) {
            return res.status(400).json({
                message:
                    "Only active jobs can be closed"
            });
        }

        job.status =
            "CLOSED";

        await job.save();

        return res.status(200).json({
            message:
                "Job closed successfully",
            job
        });
    } catch (error) {
        console.error(
            "Close job error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while closing job"
        });
    }
};