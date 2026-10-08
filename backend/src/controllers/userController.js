import User from "../models/User.js";

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================

export const getProfile = async (req, res) => {
  try {
    // Only students can access the student profile
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        message: "Only student accounts can access this profile",
      });
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        cgpa: user.cgpa,
        graduationYear: user.graduationYear,
        resumeLink: user.resumeLink,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};

// ==========================================
// UPDATE CURRENT USER PROFILE
// ==========================================

export const updateProfile = async (req, res) => {
  try {
    // Only students can update the student profile
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        message: "Only student accounts can update this profile",
      });
    }

    const {
      name,
      phone,
      department,
      cgpa,
      graduationYear,
      resumeLink,
    } = req.body;

    // ------------------------------------------
    // Validate name
    // ------------------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // ------------------------------------------
    // Validate phone
    // ------------------------------------------

    const cleanedPhone = phone?.trim() || null;

    // ------------------------------------------
    // Validate department
    // ------------------------------------------

    if (!department || !department.trim()) {
      return res.status(400).json({
        message: "Department is required",
      });
    }

    // ------------------------------------------
    // Validate CGPA
    // ------------------------------------------

    if (cgpa === undefined || cgpa === null || cgpa === "") {
      return res.status(400).json({
        message: "CGPA is required",
      });
    }

    const numericCgpa = Number(cgpa);

    if (
      Number.isNaN(numericCgpa) ||
      numericCgpa < 0 ||
      numericCgpa > 10
    ) {
      return res.status(400).json({
        message: "CGPA must be between 0 and 10",
      });
    }

    // ------------------------------------------
    // Validate graduation year
    // ------------------------------------------

    if (
      graduationYear === undefined ||
      graduationYear === null ||
      graduationYear === ""
    ) {
      return res.status(400).json({
        message: "Graduation year is required",
      });
    }

    const numericGraduationYear = Number(graduationYear);

    if (
      !Number.isInteger(numericGraduationYear) ||
      numericGraduationYear < 2020 ||
      numericGraduationYear > 2100
    ) {
      return res.status(400).json({
        message: "Please enter a valid graduation year",
      });
    }

    // ------------------------------------------
    // Resume link
    // ------------------------------------------

    const cleanedResumeLink = resumeLink?.trim() || null;

    // ------------------------------------------
    // Update user
    // ------------------------------------------

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name: name.trim(),
        phone: cleanedPhone,
        department: department.trim(),
        cgpa: numericCgpa,
        graduationYear: numericGraduationYear,
        resumeLink: cleanedResumeLink,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ------------------------------------------
    // Response
    // ------------------------------------------

    return res.status(200).json({
      message: "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        cgpa: user.cgpa,
        graduationYear: user.graduationYear,
        resumeLink: user.resumeLink,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Server error while updating profile",
    });
  }
};