import AuditLog from "../models/AuditLog.js";


// ==========================================
// ADMIN: GET AUDIT LOGS
// ==========================================

export const getAuditLogs = async (
    req,
    res
) => {
    try {

        const {
            action,
            targetType
        } = req.query;


        // ======================================
        // BUILD FILTER
        // ======================================

        const filter = {};


        if (
            action &&
            [
                "APPROVED",
                "REJECTED"
            ].includes(action)
        ) {
            filter.action = action;
        }


        if (
            targetType &&
            [
                "COMPANY",
                "JOB",
                "Company",
                "Job Posting"
            ].includes(targetType)
        ) {
            filter.targetType =
                targetType;
        }


        // ======================================
        // FETCH LOGS
        // ======================================

        const logs =
            await AuditLog.find(filter)

                // Current admin system
                .populate(
                    "reviewerId",
                    "name email role"
                )

                // Compatibility with older records
                .populate(
                    "reviewer",
                    "name email role"
                )

                .sort({
                    createdAt: -1
                });


        // ======================================
        // RESPONSE
        // ======================================

        return res.status(200).json({
            count: logs.length,
            logs
        });

    } catch (error) {

        console.error(
            "Get audit logs error:",
            error
        );


        return res.status(500).json({
            message:
                "Server error while fetching audit logs"
        });
    }
};