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
        return <main>Carregando ingressos...</main>;
    }

    if (error) {
        return <main>{error}</main>;
    }

    const tickets = reservations.flatMap((reservation) =>
        reservation.tickets.map((ticket) => ({
            ticket,
            event: reservation.event,
        })),
    );

    return (
        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
        <main>
            <h1>Meus ingressos</h1>

            {tickets.length === 0 ? (
                <p>Você ainda não possui ingressos.</p>
            ) : (
                <section>
                    {tickets.map(({ ticket, event }) => (
                        <article key={ticket.id}>
                            <h2>{event.title}</h2>

                            <p>
                                {new Date(event.date).toLocaleDateString("pt-BR")}
                            </p>

                            <p>{event.location}</p>

                            <p>Status: {ticket.status}</p>

                            <QRCodeSVG
                                value={ticket.qrCode}
                                size={220}
                            />

                            <p>
                                <a
                                    href={`/ingresso/${ticket.shareToken}`}
                                >
                                    Compartilhar ingresso
                                </a>
                            </p>
                        </article>
                    ))}
                </section>
            )}
        </main>
        </ProtectedRoute>
    );
}