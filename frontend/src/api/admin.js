import apiRequest from "./api.js";


// ==========================================
// ADMIN DASHBOARD
// ==========================================

export const getAdminDashboard = async () => {

    return await apiRequest(
        "/admin/dashboard",
        {
            method: "GET"
        }
    );

};


// ==========================================
// ADMIN COMPANIES
// ==========================================

export const getAdminCompanies = async () => {

    return await apiRequest(
        "/admin/companies",
        {
            method: "GET"
        }
    );

};


// ==========================================
// ADMIN JOB POSTINGS
// ==========================================

export const getAdminJobs = async () => {

    return await apiRequest(
        "/admin/jobs",
        {
            method: "GET"
        }
    );

};


// ==========================================
// ADMIN AUDIT LOGS
// ==========================================

export const getAuditLogs = async (
    filters = {}
) => {

    const params =
        new URLSearchParams();


    if (
        filters.action
    ) {

        params.set(
            "action",
            filters.action
        );

    }


    if (
        filters.targetType
    ) {

        params.set(
            "targetType",
            filters.targetType
        );

    }


    const query =
        params.toString();


    return await apiRequest(
        `/admin/audit-logs${
            query
                ? `?${query}`
                : ""
        }`,
        {
            method: "GET"
        }
    );

};


// ==========================================
// COMPANY APPROVAL
// ==========================================

export const approveCompany = async (
    id
) => {

    return await apiRequest(
        `/admin/companies/${id}/approve`,
        {
            method: "PATCH"
        }
    );

};


export const rejectCompany = async (
    id,
    rejectionReason
) => {

    return await apiRequest(
        `/admin/companies/${id}/reject`,
        {
            method: "PATCH",

            body: JSON.stringify({
                rejectionReason
            })
        }
    );

};


// ==========================================
// JOB APPROVAL
// ==========================================

export const approveJob = async (
    id
) => {

    return await apiRequest(
        `/admin/jobs/${id}/approve`,
        {
            method: "PATCH"
        }
    );

};


export const rejectJob = async (
    id,
    rejectionReason
) => {

    return await apiRequest(
        `/admin/jobs/${id}/reject`,
        {
            method: "PATCH",

            body: JSON.stringify({
                rejectionReason
            })
        }
    );

};


export default {

    getAdminDashboard,

    getAdminCompanies,

    getAdminJobs,

    getAuditLogs,

    approveCompany,

    rejectCompany,

    approveJob,

    rejectJob

};