import apiRequest from "./api.js";

// ==========================================
// GET MY COMPANY
// ==========================================

export const getMyCompany = async () => {
    return await apiRequest("/companies/my", {
        method: "GET"
    });
};


// ==========================================
// CREATE COMPANY
// ==========================================

export const createCompany = async (companyData) => {
    return await apiRequest("/companies", {
        method: "POST",
        body: JSON.stringify(companyData)
    });
};


// ==========================================
// UPDATE MY COMPANY
// ==========================================

export const updateMyCompany = async (companyData) => {
    return await apiRequest("/companies/my", {
        method: "PUT",
        body: JSON.stringify(companyData)
    });
};