import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },

        status: {
            type: String,
            enum: [
                "APPLIED",
                "UNDER_REVIEW",
                "SHORTLISTED",
                "INTERVIEW",
                "SELECTED",
                "REJECTED"
            ],
            default: "APPLIED"
        },

        statusHistory: [
            {
                status: {
                    type: String,
                    enum: [
                        "APPLIED",
                        "UNDER_REVIEW",
                        "SHORTLISTED",
                        "INTERVIEW",
                        "SELECTED",
                        "REJECTED"
                    ],
                    required: true
                },

                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

applicationSchema.index(
    {
        student: 1,
        job: 1
    },
    {
        unique: true
    }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;