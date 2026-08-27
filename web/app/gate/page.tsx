
"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    removeToken,
} from "@/lib/auth";
import { Html5Qrcode } from "html5-qrcode";

type Event = {
    id: string;
    title: string;
    date: string;
    location: string;
};

type ValidatedTicket = {
    id: string;
    status: string;
    usedAt: string | null;
};

function getTicketIdFromQr(qrCode: string): string {
    const parts = qrCode.split(".");

    if (parts.length !== 3) {
        throw new Error("QR Code inválido");
    }

    try {
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
        );

        if (!payload.ticketId) {
            throw new Error("QR Code inválido");
        }

        return payload.ticketId;
    } catch {
        throw new Error("QR Code inválido");
    }
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function GatePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventId, setEventId] = useState("");
    const [qrCode, setQrCode] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState("");

    function handleLogout() {
        removeToken();
        window.location.href = "/login";
    }

    useEffect(() => {
        async function loadEvents() {
            try {
                const data = await apiFetch<Event[]>("/events");
                setEvents(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os eventos.",
                );
            } finally {
                setLoadingEvents(false);
            }
        }

        loadEvents();
    }, []);

    async function handleValidate() {
        setMessage("");
        setError("");

        if (!eventId) {
            setError("Selecione um evento.");
            return;
        }

        if (!qrCode.trim()) {
            setError("Informe o QR Code.");
            return;
        }

        try {
            setLoading(true);

            const ticketId = getTicketIdFromQr(qrCode.trim());

            const result = await apiFetch<{
                message: string;
                ticket: ValidatedTicket;
            }>(`/tickets/${ticketId}/validate`, {
                method: "POST",
                body: JSON.stringify({
                    qrCode: qrCode.trim(),
                    eventId,
                }),
            });

            setMessage(result.message);
            setQrCode("");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível validar o ingresso.",
            );
        } finally {
            setLoading(false);
        }
    }

    function startScanner() {
        setCameraError("");
        setScanning(true);
    }

    useEffect(() => {
        if (!scanning) {
            return;
        }

        let scanner: Html5Qrcode | null = null;
        let stopped = false;

        async function initializeScanner() {
            try {
                scanner = new Html5Qrcode("qr-reader");

                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        if (stopped) {
                            return;
                        }

                        stopped = true;

                        setQrCode(decodedText);
                        setMessage("");
                        setError("");
                        setScanning(false);
                    },
                    () => {
                        // Erros de leitura são ignorados enquanto procura o QR.
                    },
                );
            } catch (error) {
                if (stopped) {
                    return;
                }

                console.error("Erro ao abrir câmera:", error);

                setScanning(false);
                scannerRef.current = null;

                setCameraError(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível acessar a câmera.",
                );
            }
        }

        initializeScanner();

        return () => {
            stopped = true;

            if (scanner) {
                scanner.stop().catch(() => { });
            }

            scannerRef.current = null;
        };
    }, [scanning]);

    async function stopScanner() {
        const scanner = scannerRef.current;

        setScanning(false);

        if (!scanner) {
            return;
        }

        try {
            await scanner.stop();
            scanner.clear();
        } catch {
            // O scanner pode já ter sido encerrado.
        }

        scannerRef.current = null;
    }
    useEffect(() => {
        return () => {
            const scanner = scannerRef.current;

            if (scanner) {
                scanner.stop().catch(() => { });
            }
        };
    }, []);

    const selectedEvent = events.find(
        (event) => event.id === eventId,
    );

    return (
        <ProtectedRoute allowedRoles={["GATE"]}>
            <main className="gate-page">
                <div className="gate-container">
                    <section className="gate-heading">
                        <div>
                            <span className="gate-eyebrow">
                                ELITE EVENTS · GATE
                            </span>

                            <h1>
                                Validação de
                                <span> ingressos.</span>
                            </h1>

                            <p>
                                Confirme rapidamente a autenticidade
                                de cada ingresso antes da entrada.
                            </p>
                        </div>

                        

                        <div className="gate-status">
                            <span className="gate-status__dot" />
                            PORTARIA ATIVA
                        </div>
                    </section>

                    <section className="gate-panel">
                        <div className="gate-panel__header">
                            <div>
                                <span>CONTROLE DE ACESSO</span>
                                <h2>Validar ingresso</h2>
                            </div>

                            <div className="gate-panel__number">
                                01
                            </div>
                        </div>

                        <div className="gate-form">
                            <div className="gate-field">
                                <label htmlFor="event">
                                    Evento
                                </label>

                                <select
                                    id="event"
                                    value={eventId}
                                    onChange={(e) => {
                                        setEventId(e.target.value);
                                        setMessage("");
                                        setError("");
                                    }}
                                    disabled={loadingEvents}
                                >
                                    <option value="">
                                        {loadingEvents
                                            ? "Carregando eventos..."
                                            : "Selecione um evento"}
                                    </option>

                                    {events.map((event) => (
                                        <option
                                            key={event.id}
                                            value={event.id}
                                        >
                                            {event.title}
                                        </option>
                                    ))}
                                </select>

                                {selectedEvent && (
                                    <div className="gate-event-preview">
                                        <strong>
                                            {selectedEvent.title}
                                        </strong>

                                        <span>
                                            {formatDate(
                                                selectedEvent.date,
                                            )}
                                            {" · "}
                                            {new Date(
                                                selectedEvent.date,
                                            ).toLocaleTimeString(
                                                "pt-BR",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                },
                                            )}
                                        </span>

                                        <span>
                                            {selectedEvent.location}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="gate-scanner">
                                <div className="gate-scanner__header">
                                    <div>
                                        <span>LEITURA AUTOMÁTICA</span>
                                        <strong>Escanear QR Code</strong>
                                    </div>

                                    {!scanning ? (
                                        <button
                                            type="button"
                                            onClick={startScanner}
                                            disabled={loading}
                                        >
                                            Abrir câmera
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={stopScanner}
                                        >
                                            Fechar câmera
                                        </button>
                                    )}
                                </div>

                                {scanning && (
                                    <div
                                        id="qr-reader"
                                        className="gate-scanner__reader"
                                    />
                                )}

                                {!scanning && (
                                    <p className="gate-scanner__hint">
                                        Aponte a câmera para o QR Code do ingresso.
                                    </p>
                                )}

                                {cameraError && (
                                    <p className="gate-scanner__error">
                                        {cameraError}
                                    </p>
                                )}
                            </div>

                            <div className="gate-field">
                                <label htmlFor="qrCode">
                                    Ou informe o QR Code manualmente
                                </label>

                                <textarea
                                    id="qrCode"
                                    value={qrCode}
                                    onChange={(e) => {
                                        setQrCode(e.target.value);
                                        setMessage("");
                                        setError("");
                                    }}
                                    placeholder="Cole aqui o conteúdo do QR Code..."
                                    rows={6}
                                    disabled={loading}
                                />

                                <span className="gate-field__hint">
                                    Use a entrada manual caso a câmera não esteja disponível.
                                </span>
                            </div>

                            {message && (
                                <div className="gate-result gate-result--success">
                                    <div className="gate-result__icon">
                                        ✓
                                    </div>

                                    <div>
                                        <span>
                                            ACESSO AUTORIZADO
                                        </span>

                                        <strong>{message}</strong>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="gate-result gate-result--error">
                                    <div className="gate-result__icon">
                                        !
                                    </div>

                                    <div>
                                        <span>
                                            ACESSO NÃO AUTORIZADO
                                        </span>

                                        <strong>{error}</strong>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                className="gate-validate-button"
                                onClick={handleValidate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="gate-spinner" />
                                        Validando ingresso...
                                    </>
                                ) : (
                                    <>
                                        Validar ingresso
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    <p className="gate-footer">
                        Elite Events · Sistema de controle de acesso
                    </p>
                </div>
            </main>
        </ProtectedRoute >
    );
}

