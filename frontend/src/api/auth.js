import apiRequest from "./api.js";

// ==========================================
// LOGIN
// ==========================================

export const loginUser = async (
    email,
    password
) => {
    const data = await apiRequest(
        "/auth/login",
        {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    localStorage.setItem(
        "campushire_token",
        data.token
    );

    localStorage.setItem(
        "campushire_user",
        JSON.stringify(data.user)
    );

    return data;
};


// ==========================================
// REGISTER
// ==========================================

export const registerUser = async (
    name,
    email,
    password,
    role
) => {
    const data = await apiRequest(
        "/auth/register",
        {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password,
                role
            })
        }
    );

    return data;
};


// ==========================================
// LOGOUT
// ==========================================

export const logoutUser = () => {
    localStorage.removeItem(
        "campushire_token"
    );

    localStorage.removeItem(
        "campushire_user"
    );
};


// ==========================================
// CURRENT USER
// ==========================================

export const getCurrentUser = () => {
    const user = localStorage.getItem(
        "campushire_user"
    );

    return user
        ? JSON.parse(user)
        : null;
};


// ==========================================
// TOKEN
// ==========================================

export const getToken = () => {
    return localStorage.getItem(
        "campushire_token"
    );
};