import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";


// ============================================================
// ADMIN DASHBOARD
// ============================================================

export const getAdminDashboard = async (
    req,
    res
) => {

    try {

        const [
            pendingCompanies,
            pendingJobs,
            approvedCompanies,
            activeRecruiters,
            pendingCompanyItems,
            pendingJobItems,
            recentActivity
        ] = await Promise.all([

            Company.countDocuments({
                approvalStatus:
                    "PENDING_REVIEW"
            }),

            Job.countDocuments({
                status:
                    "PENDING_REVIEW"
            }),

            Company.countDocuments({
                approvalStatus:
                    "APPROVED"
            }),

            User.countDocuments({
                role:
                    "RECRUITER"
            }),

            Company.find({
                approvalStatus:
                    "PENDING_REVIEW"
            })
                .populate(
                    "recruiter",
                    "name email"
                )
                .sort({
                    createdAt: -1
                })
                .limit(5),

            Job.find({
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
                })
                .limit(5),

            AuditLog.find({})
                .populate(
                    "reviewerId",
                    "name email role"
                )
                .sort({
                    createdAt: -1
                })
                .limit(5)

        ]);


        return res.status(200).json({

            stats: {

                pendingCompanies,

                pendingJobs,

                approvedCompanies,

                activeRecruiters

            },

            pendingCompanies:
                pendingCompanyItems,

            pendingJobs:
                pendingJobItems,

            recentActivity

        });

    } catch (error) {

        console.error(
            "Get admin dashboard error:",
            error
        );

        return res.status(500).json({

            message:
                "Server error while loading admin dashboard"

        });

    }

};


// ============================================================
// ADMIN: GET ALL COMPANIES
// ============================================================

export const getAdminCompanies = async (
    req,
    res
) => {

    try {

        const companies =
            await Company.find({})

                .populate(
                    "recruiter",
                    "name email role phone"
                )

                .populate(
                    "approvedBy",
                    "name email role"
                )

                .sort({
                    createdAt: -1
                });


        const companyIds =
            companies.map(
                (company) =>
                    company._id
            );


        const jobCounts =
            companyIds.length > 0

                ? await Job.aggregate([
                      {
                          $match: {
                              company: {
                                  $in:
                                      companyIds
                              }
                          }
                      },

                      {
                          $group: {
                              _id:
                                  "$company",

                              count: {
                                  $sum: 1
                              }
                          }
                      }
                  ])

                : [];


        const jobCountMap =
            new Map(
                jobCounts.map(
                    (item) => [
                        item._id.toString(),
                        item.count
                    ]
                )
            );


        const result =
            companies.map(
                (company) => {

                    const companyObject =
                        company.toObject();


                    return {

                        ...companyObject,

                        jobCount:
                            jobCountMap.get(
                                company._id.toString()
                            ) || 0

                    };

                }
            );


        return res.status(200).json({

            count:
                result.length,

            companies:
                result

        });

    } catch (error) {

        console.error(
            "Get admin companies error:",
            error
        );

        return res.status(500).json({

            message:
                "Server error while fetching companies"

        });

    }

};


// ============================================================
// ADMIN: GET ALL JOBS
// ============================================================

export const getAdminJobs = async (
    req,
    res
) => {

    try {

        const jobs =
            await Job.find({})

                .populate(
                    "company",
                    "companyName industry website location employeeCount approvalStatus"
                )

                .populate(
                    "createdBy",
                    "name email phone role"
                )

                .populate(
                    "approvedBy",
                    "name email role"
                )

                .sort({
                    createdAt: -1
                });


        const jobIds =
            jobs.map(
                (job) =>
                    job._id
            );


        const applicantCounts =
            jobIds.length > 0

                ? await Application.aggregate([
                      {
                          $match: {
                              job: {
                                  $in:
                                      jobIds
                              }
                          }
                      },

                      {
                          $group: {
                              _id:
                                  "$job",

                              count: {
                                  $sum: 1
                              }
                          }
                      }
                  ])

                : [];


        const applicantCountMap =
            new Map(
                applicantCounts.map(
                    (item) => [
                        item._id.toString(),
                        item.count
                    ]
                )
            );


        const result =
            jobs.map(
                (job) => {

                    const jobObject =
                        job.toObject();


                    return {

                        ...jobObject,

                        applicantsCount:
                            applicantCountMap.get(
                                job._id.toString()
                            ) || 0

                    };

                }
            );


        return res.status(200).json({

            count:
                result.length,

            jobs:
                result

        });

    } catch (error) {

        console.error(
            "Get admin jobs error:",
            error
        );

        return res.status(500).json({

            message:
                "Server error while fetching job postings"

        });

    }

};


// ============================================================
// ADMIN AUDIT LOGS
// ============================================================

export const getAuditLogs = async (
    req,
    res
) => {

    try {

        const {
            action,
            targetType
        } = req.query;


        const filter = {};


        if (
            action &&
            [
                "APPROVED",
                "REJECTED"
            ].includes(
                action
            )
        ) {

            filter.action =
                action;

        }


        if (
            targetType &&
            [
                "COMPANY",
                "JOB"
            ].includes(
                targetType
            )
        ) {

            filter.targetType =
                targetType;

        }


        const logs =
            await AuditLog.find(
                filter
            )
                .populate(
                    "reviewerId",
                    "name email role"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            count:
                logs.length,

            logs

        });

    } catch (error) {

        console.error(
            "Get audit logs error:",
            error
        );

        return res.status(500).json({

            message:
                "Server error while fetching audit logs"

        });

    }

};


// ============================================================
// ADMIN: APPROVE COMPANY
// ============================================================

export const approveCompany = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        const company =
            await Company.findById(
                id
            );


        if (!company) {

            return res.status(404).json({

                message:
                    "Company not found"

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

        company.rejectionReason =
            null;


        await company.save();


        await AuditLog.create({

            action:
                "APPROVED",

            targetType:
                "COMPANY",

            targetId:
                company._id,

            description:
                `Company registration approved: ${company.companyName}`,

            reviewerId:
                req.user.userId

        });


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


// ============================================================
// ADMIN: REJECT COMPANY
// ============================================================

export const rejectCompany = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        const {
            rejectionReason
        } = req.body;


        const company =
            await Company.findById(
                id
            );


        if (!company) {

            return res.status(404).json({

                message:
                    "Company not found"

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


        await AuditLog.create({

            action:
                "REJECTED",

            targetType:
                "COMPANY",

            targetId:
                company._id,

            description:
                `Company registration rejected: ${company.companyName}`,

            reviewerId:
                req.user.userId

        });


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


// ============================================================
// ADMIN: APPROVE JOB
// ============================================================

export const approveJob = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        const job =
            await Job.findById(
                id
            );


        if (!job) {

            return res.status(404).json({

                message:
                    "Job not found"

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


        job.status =
            "APPROVED";

        job.approvedBy =
            req.user.userId;

        job.approvedAt =
            new Date();

        job.rejectionReason =
            null;


        await job.save();


        await AuditLog.create({

            action:
                "APPROVED",

            targetType:
                "JOB",

            targetId:
                job._id,

            description:
                `Job posting approved: ${job.title}`,

            reviewerId:
                req.user.userId

        });


        const populatedJob =
            await Job.findById(
                job._id
            )
                .populate(
                    "company",
                    "companyName industry location"
                )
                .populate(
                    "createdBy",
                    "name email"
                );


        return res.status(200).json({

            message:
                "Job approved successfully",

            job:
                populatedJob

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


// ============================================================
// ADMIN: REJECT JOB
// ============================================================

export const rejectJob = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        const {
            rejectionReason
        } = req.body;


        const job =
            await Job.findById(
                id
            );


        if (!job) {

            return res.status(404).json({

                message:
                    "Job not found"

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


        const cleanedReason =
            String(
                rejectionReason ||
                ""
            ).trim();


        if (
            !cleanedReason
        ) {

            return res.status(400).json({

                message:
                    "A rejection reason is required"

            });

        }


        job.status =
            "REJECTED";

        job.approvedBy =
            req.user.userId;

        job.approvedAt =
            new Date();

        job.rejectionReason =
            cleanedReason;


        await job.save();


        await AuditLog.create({

            action:
                "REJECTED",

            targetType:
                "JOB",

            targetId:
                job._id,

            description:
                `Job posting rejected: ${job.title}`,

            reviewerId:
                req.user.userId

        });


        const populatedJob =
            await Job.findById(
                job._id
            )
                .populate(
                    "company",
                    "companyName industry location"
                )
                .populate(
                    "createdBy",
                    "name email"
                );


        return res.status(200).json({

            message:
                "Job rejected successfully",

            job:
                populatedJob

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