import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["STUDENT", "RECRUITER", "ADMIN"],
      required: true,
    },

    department: {
      type: String,
      trim: true,
      default: null,
    },

    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    graduationYear: {
      type: Number,
      default: null,
    },

    resumeLink: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
