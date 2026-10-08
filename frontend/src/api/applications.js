import apiRequest from "./api.js";

// ============================================================
// STUDENT
// ============================================================

export const applyForJob = async (jobId) => {
    return await apiRequest("/applications", {
        method: "POST",
        body: JSON.stringify({
            jobId
        })
    });
};

export const getMyApplications = async () => {
    return await apiRequest("/applications/my", {
        method: "GET"
    });
};

export const getMyApplicationById = async (id) => {
    return await apiRequest(`/applications/my/${id}`, {
        method: "GET"
    });
};

// ============================================================
// RECRUITER
// ============================================================

export const getRecruiterApplications = async () => {
    return await apiRequest("/applications/recruiter", {
        method: "GET"
    });
};

export const getRecruiterApplicationById = async (id) => {
    return await apiRequest(
        `/applications/recruiter/${id}`,
        {
            method: "GET"
        }
    );
};

export const updateApplicationStatus = async (
    id,
    status
) => {
    return await apiRequest(
        `/applications/${id}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        }
    );
};

export const updateApplicationsStatusBatch = async (
    applicationIds,
    status
) => {
    return await apiRequest(
        "/applications/batch-status",
        {
            method: "PATCH",
            body: JSON.stringify({
                applicationIds,
                status
            })
        }
    );
};