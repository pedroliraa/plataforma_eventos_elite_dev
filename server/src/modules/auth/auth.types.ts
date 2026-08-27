export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    //role: "ORGANIZER" | "CUSTOMER" | "GATE";
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: "ORGANIZER" | "CUSTOMER" | "GATE";
    };
    token: string;
}