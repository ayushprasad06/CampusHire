import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true
        },

        industry: {
            type: String,
            required: true,
            trim: true
        },

        website: {
            type: String,
            trim: true,
            default: null
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        employeeCount: {
            type: String,
            trim: true,
            default: null
        },

        description: {
            type: String,
            trim: true,
            default: null
        },

        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        approvalStatus: {
            type: String,
            enum: ["PENDING_REVIEW", "APPROVED", "REJECTED"],
            default: "PENDING_REVIEW"
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        approvedAt: {
            type: Date,
            default: null
        },

        rejectionReason: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Company = mongoose.model("Company", companySchema);

export default Company;