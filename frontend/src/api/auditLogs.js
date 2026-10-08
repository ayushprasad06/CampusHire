import apiRequest from "./api.js";


// ==========================================
// HELPERS
// ==========================================

const normalizeTargetType = (
    value
) => {

    if (
        value === "COMPANY" ||
        value === "Company"
    ) {
        return "Company";
    }


    if (
        value === "JOB" ||
        value === "Job Posting"
    ) {
        return "Job Posting";
    }


    return value || "Company";
};


// ==========================================
// EXTRACT TARGET NAME
// ==========================================

const extractTargetName = (
    log
) => {

    // Newer records may contain targetName
    if (log.targetName) {
        return log.targetName;
    }


    /*
        Current adminController stores descriptions like:

        Company registration approved: Amazon

        Job posting approved: Software Development Engineer

        So if targetName is not explicitly stored,
        extract the part after the colon.
    */

    const description =
        String(
            log.description || ""
        ).trim();


    if (
        description.includes(":")
    ) {

        const parts =
            description.split(":");


        const possibleName =
            parts
                .slice(1)
                .join(":")
                .trim();


        if (possibleName) {
            return possibleName;
        }
    }


    return normalizeTargetType(
        log.targetType
    );
};


// ==========================================
// NORMALIZE ONE LOG
// ==========================================

const normalizeLog = (
    log
) => {

    /*
        reviewerId can be:

        1. A populated User object
        2. A raw ObjectId/string

        Older records may instead use reviewer.
    */

    const populatedReviewer =
        log.reviewerId &&
        typeof log.reviewerId ===
            "object"

            ? log.reviewerId

            : log.reviewer &&
                typeof log.reviewer ===
                    "object"

                ? log.reviewer

                : null;


    // ======================================
    // REVIEWER ID
    // ======================================

    const reviewerId =
        populatedReviewer?._id ||

        (
            typeof log.reviewerId ===
            "string"

                ? log.reviewerId

                : typeof log.reviewer ===
                    "string"

                    ? log.reviewer

                    : ""
        );


    // ======================================
    // RETURN NORMALIZED LOG
    // ======================================

    return {

        ...log,


        // Convert COMPANY -> Company
        // Convert JOB -> Job Posting

        targetType:
            normalizeTargetType(
                log.targetType
            ),


        // Ensure targetName exists

        targetName:
            extractTargetName(
                log
            ),


        // Keep populated reviewer object

        reviewer:
            populatedReviewer,


        // IMPORTANT:
        // Keep reviewerId as a string,
        // because the React page searches
        // using .toLowerCase()

        reviewerId,


        reviewerName:
            log.reviewerName ||

            populatedReviewer?.name ||

            "Placement Admin",


        reviewerEmail:
            log.reviewerEmail ||

            populatedReviewer?.email ||

            "—"
    };
};


// ==========================================
// ADMIN: GET AUDIT LOGS
// ==========================================

export const getAuditLogs = async (
    filters = {}
) => {

    const params =
        new URLSearchParams();


    // ======================================
    // ACTION FILTER
    // ======================================

    if (
        filters.action
    ) {

        params.set(
            "action",
            filters.action
        );
    }


    // ======================================
    // TARGET TYPE FILTER
    // ======================================

    if (
        filters.targetType
    ) {

        params.set(
            "targetType",
            filters.targetType
        );
    }


    // ======================================
    // QUERY STRING
    // ======================================

    const query =
        params.toString();


    // ======================================
    // IMPORTANT
    // ======================================

    /*
        Use the ADMIN endpoint.

        Previously this API called:

        /audit-logs

        while the actual admin system uses:

        /admin/audit-logs
    */

    const data =
        await apiRequest(
            `/admin/audit-logs${
                query
                    ? `?${query}`
                    : ""
            }`,
            {
                method: "GET"
            }
        );


    // ======================================
    // NORMALIZED RESPONSE
    // ======================================

    return {

        ...data,

        logs:
            Array.isArray(
                data?.logs
            )

                ? data.logs.map(
                      normalizeLog
                  )

                : []
    };
};


export default getAuditLogs;