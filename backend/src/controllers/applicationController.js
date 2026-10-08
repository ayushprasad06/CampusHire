import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

const APPLICATION_STATUSES = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
    "REJECTED"
];

// ============================================================
// APPLICATION PROGRESS ORDER
// ============================================================

const PROGRESS_STATUSES = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED"
];


// ============================================================
// REBUILD APPLICATION STATUS HISTORY
//
// Rules:
// 1. Moving backwards removes all future stages.
// 2. Moving forward normally keeps existing timestamps.
// 3. If a stage is skipped, it receives the timestamp
//    of the stage we jumped to.
// 4. REJECTED is treated as a terminal status.
// ============================================================

const rebuildStatusHistory = (
    application,
    nextStatus,
    changedBy,
    changedAt
) => {
    const existingHistory =
        Array.isArray(
            application.statusHistory
        )
            ? application.statusHistory
            : [];

    // --------------------------------------------------------
    // REJECTED
    // --------------------------------------------------------

    if (nextStatus === "REJECTED") {
        const currentProgressIndex =
            PROGRESS_STATUSES.indexOf(
                application.status
            );

        const validProgressHistory =
            existingHistory.filter(
                (entry) => {
                    const index =
                        PROGRESS_STATUSES.indexOf(
                            entry.status
                        );

                    return (
                        index !== -1 &&
                        index <=
                            currentProgressIndex
                    );
                }
            );

        application.statusHistory = [
            ...validProgressHistory,
            {
                status: "REJECTED",
                changedBy,
                changedAt
            }
        ];

        return;
    }


    // --------------------------------------------------------
    // TARGET PROGRESS STATUS
    // --------------------------------------------------------

    const targetIndex =
        PROGRESS_STATUSES.indexOf(
            nextStatus
        );

    if (targetIndex === -1) {
        throw new Error(
            "Invalid progress status"
        );
    }


    // --------------------------------------------------------
    // BUILD A CLEAN HISTORY
    // --------------------------------------------------------

    const rebuiltHistory = [];

    for (
        let index = 0;
        index <= targetIndex;
        index++
    ) {
        const stage =
            PROGRESS_STATUSES[index];

        /*
         * Find the most recent existing record
         * for this stage.
         */
        const existingEntry =
            [...existingHistory]
                .reverse()
                .find(
                    (entry) =>
                        entry.status ===
                        stage
                );


        // ----------------------------------------------------
        // CURRENT TARGET
        // ----------------------------------------------------

        if (stage === nextStatus) {
            rebuiltHistory.push({
                status: stage,
                changedBy,
                changedAt
            });

            continue;
        }


        // ----------------------------------------------------
        // EXISTING PREVIOUS STAGE
        // ----------------------------------------------------

        if (existingEntry) {
            rebuiltHistory.push({
                status: stage,

                changedBy:
                    existingEntry.changedBy ||
                    changedBy,

                changedAt:
                    existingEntry.changedAt ||
                    changedAt
            });

            continue;
        }


        // ----------------------------------------------------
        // SKIPPED STAGE
        //
        // Example:
        //
        // SHORTLISTED → SELECTED
        //
        // INTERVIEW was skipped.
        // Therefore INTERVIEW gets the same timestamp
        // as SELECTED.
        // ----------------------------------------------------

        rebuiltHistory.push({
            status: stage,
            changedBy,
            changedAt
        });
    }


    // --------------------------------------------------------
    // IMPORTANT:
    //
    // Anything after targetIndex is intentionally removed.
    // --------------------------------------------------------

    application.statusHistory =
        rebuiltHistory;
};

// ============================================================
// STUDENT: APPLY FOR JOB
// ============================================================

export const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required"
            });
        }

        const student = await User.findById(req.user.userId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (student.role !== "STUDENT") {
            return res.status(403).json({
                message: "Only students can apply for jobs"
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // Only active jobs can receive applications
        if (job.status !== "ACTIVE") {
            return res.status(400).json({
                message: "This job is not currently accepting applications"
            });
        }

        // Application deadline check
        if (
            !job.applicationDeadline ||
            new Date(job.applicationDeadline) <= new Date()
        ) {
            return res.status(400).json({
                message:
                    "The application deadline for this job has passed or is not available."
            });
        }

        // ----------------------------------------------------
        // SERVER-SIDE ELIGIBILITY CHECK
        // ----------------------------------------------------

        if (student.cgpa === null || student.cgpa === undefined) {
            return res.status(400).json({
                message:
                    "You are not eligible to apply because your CGPA is not updated in your profile."
            });
        }

        if (student.department === null || !student.department) {
            return res.status(400).json({
                message:
                    "You are not eligible to apply because your department is not updated in your profile."
            });
        }

        if (
            student.graduationYear === null ||
            student.graduationYear === undefined
        ) {
            return res.status(400).json({
                message:
                    "You are not eligible to apply because your graduation year is not updated in your profile."
            });
        }

        if (student.cgpa < job.minimumCGPA) {
            return res.status(403).json({
                message:
                    `You are not eligible for this job. Required minimum CGPA is ${job.minimumCGPA}, but your CGPA is ${student.cgpa}.`
            });
        }

        const allowedDepartments = job.allowedDepartments.map(
            (department) => department.trim().toLowerCase()
        );

        if (
            !allowedDepartments.includes(
                student.department.trim().toLowerCase()
            )
        ) {
            return res.status(403).json({
                message:
                    `You are not eligible for this job. Your department (${student.department}) is not included in the allowed departments.`
            });
        }

        if (
            Number(student.graduationYear) !==
            Number(job.graduationYear)
        ) {
            return res.status(403).json({
                message:
                    `You are not eligible for this job. This posting is for graduation year ${job.graduationYear}.`
            });
        }

        // ----------------------------------------------------
        // DUPLICATE APPLICATION CHECK
        // ----------------------------------------------------

        const existingApplication = await Application.findOne({
            student: student._id,
            job: job._id
        });

        if (existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job",
                application: existingApplication
            });
        }

        // ----------------------------------------------------
        // CREATE APPLICATION
        // ----------------------------------------------------

        const application = await Application.create({
            student: student._id,
            job: job._id,
            status: "APPLIED",
            statusHistory: [
                {
                    status: "APPLIED",
                    changedBy: student._id,
                    changedAt: new Date()
                }
            ]
        });

        const populatedApplication =
            await Application.findById(application._id)
                .populate(
                    "student",
                    "name email phone department cgpa graduationYear resumeLink"
                )
                .populate(
                    {
                        path: "job",
                        populate: {
                            path: "company",
                            select:
                                "companyName industry website location"
                        }
                    }
                );

        return res.status(201).json({
            message: "Application submitted successfully",
            application: populatedApplication
        });
    } catch (error) {
        console.error("Apply for job error:", error);

        return res.status(500).json({
            message:
                "Server error while submitting application"
        });
    }
};

// ============================================================
// STUDENT: GET MY APPLICATIONS
// ============================================================

export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            student: req.user.userId
        })
            .populate({
                path: "job",
                populate: {
                    path: "company",
                    select:
                        "companyName industry website location"
                }
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error(
            "Get my applications error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching applications"
        });
    }
};

// ============================================================
// STUDENT: GET SINGLE APPLICATION
// ============================================================

export const getMyApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findOne({
            _id: id,
            student: req.user.userId
        })
            .populate(
                "student",
                "name email phone department cgpa graduationYear resumeLink"
            )
            .populate({
                path: "job",
                populate: {
                    path: "company",
                    select:
                        "companyName industry website location employeeCount"
                }
            })
            .populate(
                "statusHistory.changedBy",
                "name email role"
            );

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        return res.status(200).json({
            application
        });
    } catch (error) {
        console.error(
            "Get application error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching application"
        });
    }
};

// ============================================================
// RECRUITER: GET ALL APPLICANTS
// ============================================================

export const getRecruiterApplications = async (
    req,
    res
) => {
    try {
        // Find jobs owned by this recruiter
        const recruiterJobs = await Job.find({
            createdBy: req.user.userId
        }).select("_id");

        const jobIds = recruiterJobs.map(
            (job) => job._id
        );

        const applications = await Application.find({
            job: {
                $in: jobIds
            }
        })
            .populate(
                "student",
                "name email phone department cgpa graduationYear resumeLink"
            )
            .populate({
                path: "job",
                populate: {
                    path: "company",
                    select:
                        "companyName industry location website"
                }
            })
            .populate(
                "statusHistory.changedBy",
                "name email role"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error(
            "Get recruiter applications error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching applicants"
        });
    }
};

// ============================================================
// RECRUITER: GET SINGLE APPLICANT
// ============================================================

export const getRecruiterApplicationById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id)
            .populate(
                "student",
                "name email phone department cgpa graduationYear resumeLink"
            )
            .populate({
                path: "job",
                populate: {
                    path: "company",
                    select:
                        "companyName industry location website employeeCount"
                }
            })
            .populate(
                "statusHistory.changedBy",
                "name email role"
            );

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        // Make sure this application belongs to
        // one of the recruiter's jobs.
        if (
            !application.job ||
            application.job.createdBy?.toString() !==
                req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to view this application"
            });
        }

        return res.status(200).json({
            application
        });
    } catch (error) {
        console.error(
            "Get recruiter application error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching applicant"
        });
    }
};

// ============================================================
// RECRUITER: UPDATE SINGLE APPLICATION STATUS
// ============================================================

// ============================================================
// RECRUITER: UPDATE SINGLE APPLICATION STATUS
// ============================================================

export const updateApplicationStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (
            !APPLICATION_STATUSES.includes(
                status
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid application status"
            });
        }

        const application =
            await Application.findById(id).populate(
                "job",
                "createdBy title"
            );

        if (!application) {
            return res.status(404).json({
                message:
                    "Application not found"
            });
        }


        // ----------------------------------------------------
        // SECURITY CHECK
        // ----------------------------------------------------

        if (
            !application.job ||
            application.job.createdBy.toString() !==
                req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "You can only update applications for your own jobs"
            });
        }


        // ----------------------------------------------------
        // SAME STATUS
        // ----------------------------------------------------

        if (
            application.status ===
            status
        ) {
            return res.status(400).json({
                message:
                    "Application already has this status"
            });
        }


        // ----------------------------------------------------
        // SINGLE TIMESTAMP FOR THIS UPDATE
        // ----------------------------------------------------

        const changedAt =
            new Date();


        // ----------------------------------------------------
        // REBUILD HISTORY
        // ----------------------------------------------------

        rebuildStatusHistory(
            application,
            status,
            req.user.userId,
            changedAt
        );


        // ----------------------------------------------------
        // UPDATE CURRENT STATUS
        // ----------------------------------------------------

        application.status =
            status;


        await application.save();


        // ----------------------------------------------------
        // RETURN COMPLETE APPLICATION
        // ----------------------------------------------------

        const populatedApplication =
            await Application.findById(
                application._id
            )
                .populate(
                    "student",
                    "name email phone department cgpa graduationYear resumeLink"
                )
                .populate({
                    path: "job",
                    populate: {
                        path: "company",
                        select:
                            "companyName industry location website employeeCount"
                    }
                })
                .populate(
                    "statusHistory.changedBy",
                    "name email role"
                );


        return res.status(200).json({
            message:
                "Application status updated successfully",

            application:
                populatedApplication
        });
    } catch (error) {
        console.error(
            "Update application status error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while updating application status"
        });
    }
};

// ============================================================
// RECRUITER: BATCH UPDATE APPLICATION STATUS
// ============================================================

export const updateApplicationsStatusBatch = async (
    req,
    res
) => {
    try {
        const {
            applicationIds,
            status
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !Array.isArray(
                applicationIds
            ) ||
            applicationIds.length === 0
        ) {
            return res.status(400).json({
                message:
                    "At least one application must be selected"
            });
        }


        if (
            !APPLICATION_STATUSES.includes(
                status
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid application status"
            });
        }


        // ----------------------------------------------------
        // FETCH APPLICATIONS
        // ----------------------------------------------------

        const applications =
            await Application.find({
                _id: {
                    $in:
                        applicationIds
                }
            }).populate(
                "job",
                "createdBy title"
            );


        if (
            applications.length !==
            applicationIds.length
        ) {
            return res.status(404).json({
                message:
                    "One or more applications could not be found"
            });
        }


        // ----------------------------------------------------
        // SECURITY CHECK
        // ----------------------------------------------------

        const unauthorizedApplication =
            applications.find(
                (application) =>
                    !application.job ||
                    application.job.createdBy.toString() !==
                        req.user.userId
            );


        if (
            unauthorizedApplication
        ) {
            return res.status(403).json({
                message:
                    "You can only update applications for your own jobs"
            });
        }


        // ----------------------------------------------------
        // SAME TIMESTAMP FOR THE BATCH
        // ----------------------------------------------------

        const changedAt =
            new Date();


        // ----------------------------------------------------
        // UPDATE EACH APPLICATION
        // ----------------------------------------------------

        for (
            const application of
            applications
        ) {
            if (
                application.status ===
                status
            ) {
                continue;
            }


            rebuildStatusHistory(
                application,
                status,
                req.user.userId,
                changedAt
            );


            application.status =
                status;


            await application.save();
        }


        return res.status(200).json({
            message:
                `${applications.length} application(s) updated successfully`
        });
    } catch (error) {
        console.error(
            "Batch update application status error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while updating applications"
        });
    }
};