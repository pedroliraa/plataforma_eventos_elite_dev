"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import ProtectedRoute from "@/components/ProtectedRoute";

type Ticket = {
    id: string;
    qrCode: string;
    status: "VALID" | "USED" | "CANCELLED";
    shareToken: string;
};

type Event = {
    id: string;
    title: string;
    date: string;
    location: string;
};

type Reservation = {
    id: string;
    event: Event;
    tickets: Ticket[];
};

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatusLabel(status: Ticket["status"]) {
    switch (status) {
        case "VALID":
            return "Válido";
        case "USED":
            return "Utilizado";
        case "CANCELLED":
            return "Cancelado";
    }
}

export default function MeusIngressosPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadReservations() {
            try {
                const data = await apiFetch<Reservation[]>("/reservations");
                setReservations(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar seus ingressos.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadReservations();
    }, []);

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <main className="tickets-page">
                    <div className="tickets-container">
                        <p className="tickets-status">
                            Carregando seus ingressos...
                        </p>
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <main className="tickets-page">
                    <div className="tickets-container">
                        <div className="tickets-empty">
                            <h1>Meus ingressos</h1>
                            <p>{error}</p>
                        </div>
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    const tickets = reservations.flatMap((reservation) =>
        reservation.tickets.map((ticket) => ({
            ticket,
            event: reservation.event,
        })),
    );

    return (
        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <main className="tickets-page">
                <div className="tickets-container">
                    <header className="tickets-header">
                        <span className="tickets-eyebrow">
                            ELITE EVENTS
                        </span>

                        <h1>Meus ingressos</h1>

                        <p>
                            Seus ingressos para os próximos eventos.
                        </p>
                    </header>

                    {tickets.length === 0 ? (
                        <div className="tickets-empty">
                            <h2>Nenhum ingresso ainda</h2>

                            <p>
                                Quando você comprar um ingresso,
                                ele aparecerá aqui.
                            </p>
                        </div>
                    ) : (
                        <section className="tickets-list">
                            {tickets.map(({ ticket, event }) => (
                                <article
                                    key={ticket.id}
                                    className={`ticket ${ticket.status !== "VALID"
                                        ? "ticket--inactive"
                                        : ""
                                        }`}
                                >
                                    <div className="ticket-main">
                                        <div className="ticket-brand">
                                            <strong>ELITE</strong>
                                            <span>EVENTS</span>

                                    
                                        </div>

                                        <div className="ticket-content">
                                            <div className="ticket-type">
                                                INGRESSO
                                            </div>

                                            <h2>{event.title}</h2>

                                            <div className="ticket-details">
                                                <div>
                                                    <span>Data</span>
                                                    <strong>
                                                        {formatDate(event.date)}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Horário</span>
                                                    <strong>
                                                        {formatTime(event.date)}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Local</span>
                                                    <strong>
                                                        {event.location}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ticket-status">
                                            <span
                                                className={`ticket-status__dot ticket-status__dot--${ticket.status.toLowerCase()}`}
                                            />

                                            {getStatusLabel(ticket.status)}
                                        </div>
                                    </div>

                                    <div className="ticket-divider">
                                        <span />
                                        <span />
                                    </div>

                                    <div className="ticket-qr">
                                        <QRCodeSVG
                                            value={ticket.qrCode}
                                            size={190}
                                            bgColor="#ffffff"
                                            fgColor="#111111"
                                            level="M"
                                        />

                                        <p>
                                            Apresente este código na entrada
                                        </p>

                                        <a
                                            href={`/ingresso/${ticket.shareToken}`}
                                            className="ticket-share"
                                        >
                                            Compartilhar ingresso
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}

