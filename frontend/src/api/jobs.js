import apiRequest from "./api.js";

export const createJob = async (jobData) => {
    return await apiRequest("/jobs", {
        method: "POST",
        body: JSON.stringify(jobData)
    });
};

export const getMyJobs = async () => {
    return await apiRequest("/jobs/my", {
        method: "GET"
    });
};

export const getJobById = async (id) => {
    return await apiRequest(`/jobs/${id}`, {
        method: "GET"
    });
};

export const updateJob = async (id, jobData) => {
    return await apiRequest(`/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(jobData)
    });
};

export const getAvailableJobs = async () => {
    return await apiRequest("/jobs/available", {
        method: "GET"
    });
};

export const activateJob = async (id) => {
    return await apiRequest(`/jobs/${id}/activate`, {
        method: "PATCH"
    });
};

export const closeJob = async (id) => {
    return await apiRequest(`/jobs/${id}/close`, {
        method: "PATCH"
    });
};

export const getPendingJobs = async () => {
    return await apiRequest("/jobs/pending", {
        method: "GET"
    });
};

export const approveJob = async (id) => {
    return await apiRequest(`/jobs/${id}/approve`, {
        method: "PATCH"
    });
};

export const rejectJob = async (id, rejectionReason) => {
    return await apiRequest(`/jobs/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({
            rejectionReason
        })
    });
};

export default {
    createJob,
    getMyJobs,
    getJobById,
    updateJob,
    getAvailableJobs,
    activateJob,
    closeJob,
    getPendingJobs,
    approveJob,
    rejectJob
};