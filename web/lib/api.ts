import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada.");
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken();

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            ...options.headers,
        },
    });

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
        if (!response.ok) {
            throw new Error("Something went wrong");
        }

        return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}