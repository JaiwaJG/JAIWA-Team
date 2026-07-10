"use strict";

const API = {};

//Default Headers

API.getHeaders = function () {

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    const token = Storage.getToken();

    //chyam 
    //console.log("TOKEN =", token);

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;

};

//Request

API.request = async function (endpoint, options = {}) {

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, CONFIG.REQUEST_TIMEOUT);

    try {

        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...API.getHeaders(),
                ...(options.headers || {})
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        const data = await response.json();

        if (!response.ok) {

            if (
                response.status === 401 &&
                endpoint !== "/auth/refresh-token"
            ) {

                try {

                    await API.refreshAccessToken();

                    return API.request(
                        endpoint,
                        options
                    );

                } catch {

                    Storage.removeToken();
                    Storage.removeRefreshToken();
                    Storage.removeUser();

                    window.location.href = "/Login/";

                    return;

                }

            }

            const err = new Error(
                data.message || "Request failed."
            );

            err.code = data.code;
            err.status = response.status;
            err.retryAfter = data.retryAfter || 30;

            throw err;

        }

        return data;

    } catch (error) {

        clearTimeout(timeout);

        if (error.name === "AbortError") {
            throw new Error("Request timeout.");
        }

        throw error;

    }

};

//GET

API.get = function (endpoint) {

    return API.request(endpoint, {
        method: "GET"
    });

};

//ApiPOST

API.post = function (
    endpoint,
    body = {},
    token = null
) {

    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return API.request(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

};

//PUT

API.put = function (
    endpoint,
    body = {}
) {

    return API.request(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    });

};

//DELETE

API.delete = function (endpoint) {

    return API.request(endpoint, {
        method: "DELETE"
    });

};

//Refresh Token

API.refreshAccessToken = async function () {

    const refreshToken =
        Storage.getRefreshToken();

    if (!refreshToken) {
        throw new Error(
            "Refresh token not found."
        );
    }

    const result = await API.post(
        "/auth/refresh-token",
        {
            refreshToken
        }
    );

    Storage.saveToken(
        result.accessToken
    );

    if (result.refreshToken) {
        Storage.saveRefreshToken(
            result.refreshToken
        );
    }

    return result.accessToken;

};

//Current User

API.getMe = function () {

    return API.get("/auth/me");

};