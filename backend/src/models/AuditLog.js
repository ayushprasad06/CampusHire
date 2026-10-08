import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        // ==========================================
        // ACTION
        // ==========================================

        action: {
            type: String,
            enum: [
                "APPROVED",
                "REJECTED"
            ],
            required: true
        },


        // ==========================================
        // TARGET TYPE
        // ==========================================

        /*
            The current admin controller uses:

            COMPANY
            JOB

            Older approval controllers used:

            Company
            Job Posting

            Both are accepted here so existing
            records/controllers do not break.
        */

        targetType: {
            type: String,
            enum: [
                "COMPANY",
                "JOB",
                "Company",
                "Job Posting"
            ],
            required: true
        },


        // ==========================================
        // TARGET ID
        // ==========================================

        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },


        // ==========================================
        // TARGET NAME
        // ==========================================

        /*
            Older admin approval code does not send
            targetName directly.

            Therefore this is optional.

            The frontend can also extract the target
            name from the description when necessary.
        */

        targetName: {
            type: String,
            trim: true,
            default: null
        },


        // ==========================================
        // DESCRIPTION
        // ==========================================

        description: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // REVIEWER ID
        // ==========================================

        /*
            This is the field currently used by the
            adminController:

            reviewerId: req.user.userId
        */

        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ==========================================
        // LEGACY REVIEWER FIELD
        // ==========================================

        /*
            Older company/job controllers also create:

            reviewer: reviewer._id

            Keep this optional for compatibility.
        */

        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },


        // ==========================================
        // REVIEWER NAME
        // ==========================================

        /*
            These are optional because the current
            admin controller obtains reviewer information
            using populate("reviewerId").
        */

        reviewerName: {
            type: String,
            trim: true,
            default: null
        },


        // ==========================================
        // REVIEWER EMAIL
        // ==========================================

        reviewerEmail: {
            type: String,
            trim: true,
            default: null
        }
    },

    {
        timestamps: true
    }
);


const AuditLog = mongoose.model(
    "AuditLog",
    auditLogSchema
);


export default AuditLog;