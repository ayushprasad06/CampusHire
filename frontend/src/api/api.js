const API_BASE_URL = "http://localhost:5000/api";

export const apiRequest = async (
    endpoint,
    options = {}
) => {
    const token = localStorage.getItem("campushire_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    return data;
};

export default apiRequest;