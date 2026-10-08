import apiRequest from "./api.js";

// GET CURRENT STUDENT PROFILE
export const getProfile = async () => {
    return await apiRequest("/users/profile", {
        method: "GET"
    });
};

// UPDATE CURRENT STUDENT PROFILE
export const updateProfile = async (profileData) => {
    return await apiRequest("/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData)
    });
};