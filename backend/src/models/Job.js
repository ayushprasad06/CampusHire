import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: ["INTERNSHIP", "FULL_TIME"],
      required: true,
    },

    minimumCGPA: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    allowedDepartments: {
      type: [String],
      required: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    graduationYear: {
      type: Number,
      required: true,
    },

    applicationDeadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING_REVIEW", "APPROVED", "ACTIVE", "CLOSED", "REJECTED"],
      default: "PENDING_REVIEW",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
