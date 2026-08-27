"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/auth";

interface RegisterResponse {
    user: User;
}

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await apiFetch<RegisterResponse>("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            router.push("/login");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível criar a conta.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-decoration auth-decoration--one" />
            <div className="auth-decoration auth-decoration--two" />

            <section className="auth-card">
                <div className="auth-card__brand">
                    <span>ELITE</span>
                    <strong>EVENTS</strong>
                </div>

                <div className="auth-card__heading">
                    <span className="auth-eyebrow">
                        CRIAR CONTA
                    </span>

                    <h1>
                        Faça parte da
                        <span> Elite Events.</span>
                    </h1>

                    <p>
                        Crie sua conta para encontrar eventos,
                        reservar ingressos e viver novas experiências.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="auth-field">
                        <label htmlFor="name">
                            Nome
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Seu nome"
                            required
                            minLength={2}
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">
                            Senha
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Mínimo de 6 caracteres"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Criando conta..."
                            : "Criar conta"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Já tem uma conta?</span>{" "}
                    <a href="/login">
                        Entrar
                    </a>
                </div>
            </section>
        </main>
    );
}

