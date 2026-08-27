"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
    setToken,
    setUser,
    type LoginResponse,
} from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await apiFetch<LoginResponse>("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            setToken(data.token);
            setUser(data.user);

            window.dispatchEvent(new Event("auth-change"));

            switch (data.user.role) {
                case "CUSTOMER":
                    router.push("/events");
                    break;

                case "ORGANIZER":
                    router.push("/organizer");
                    break;

                case "GATE":
                    router.push("/gate");
                    break;
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível realizar o login.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-glow auth-glow--top" />
            <div className="auth-glow auth-glow--bottom" />

            <div className="auth-container">
                <div className="auth-brand">
                    <span>ELITE</span>
                    <strong>EVENTS</strong>
                </div>

                <section className="auth-card">
                    <div className="auth-card__header">
                        <span className="auth-eyebrow">
                            BEM-VINDO DE VOLTA
                        </span>

                        <h1>Entrar</h1>

                        <p>
                            Acesse sua conta para continuar.
                        </p>
                    </div>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
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
                                autoComplete="email"
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
                                placeholder="Sua senha"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="auth-error">
                                <span>!</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="auth-spinner" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span />
                        <small>OU</small>
                        <span />
                    </div>

                    <p className="auth-register">
                        Ainda não tem uma conta?{" "}
                        <Link href="/register">
                            Criar conta
                        </Link>
                    </p>
                </section>

                <p className="auth-footer">
                    Elite Events · Experiências que valem a pena.
                </p>
            </div>
        </main>
    );
}

