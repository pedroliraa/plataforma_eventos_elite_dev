"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Event = {
    id: string;
    title: string;
    type: "SHOW" | "MOVIE";
    date: string;
    location: string;
    capacity: number;
    price: string | number;
};

export default function EventoPage() {
    const params = useParams();
    const id = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [quantity, setQuantity] = useState(1);
    const [reserving, setReserving] = useState(false);
    const [reservationId, setReservationId] = useState<string | null>(null);
    const [reservationError, setReservationError] = useState("");

    const [paying, setPaying] = useState(false);
    const [paid, setPaid] = useState(false);
    const [paymentRejected, setPaymentRejected] = useState(false);
    const [paymentError, setPaymentError] = useState("");

    useEffect(() => {
        async function loadEvent() {
            try {
                const data = await apiFetch<Event>(`/events/${id}`);
                setEvent(data);
            } catch {
                setError("Não foi possível carregar o evento.");
            } finally {
                setLoading(false);
            }
        }

        loadEvent();
    }, [id]);

    if (loading) {
        return (
            <main className="event-detail-page">
                <div className="event-detail-container">
                    <p className="event-detail-status">
                        Carregando evento...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !event) {
        return (
            <main className="event-detail-page">
                <div className="event-detail-container">
                    <div className="event-detail-error">
                        <h1>Evento não encontrado</h1>
                        <p>
                            {error ||
                                "Não foi possível encontrar este evento."}
                        </p>

                        <Link href="/events">
                            Voltar para eventos
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const formattedDate = new Date(event.date).toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        },
    );

    const formattedTime = new Date(event.date).toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    const formattedPrice = Number(event.price).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
        },
    );

    return (
        <main className="event-detail-page">
            <div className="event-detail-container">
                <Link
                    href="/events"
                    className="event-detail-back"
                >
                    ← Voltar para eventos
                </Link>

                <section className="event-detail">
                    <div className="event-detail-main">
                        <div className="event-detail-heading">
                            <span className="event-detail-type">
                                {event.type === "MOVIE"
                                    ? "Filme"
                                    : "Show"}
                            </span>

                            <h1>{event.title}</h1>
                        </div>

                        <div className="event-detail-info">
                            <div>
                                <span>Data</span>
                                <strong>{formattedDate}</strong>
                            </div>

                            <div>
                                <span>Horário</span>
                                <strong>{formattedTime}</strong>
                            </div>

                            <div>
                                <span>Local</span>
                                <strong>{event.location}</strong>
                            </div>

                            <div>
                                <span>Capacidade</span>
                                <strong>
                                    {event.capacity} pessoas
                                </strong>
                            </div>
                        </div>
                    </div>

                    <aside className="event-reservation">
                        <span className="event-reservation__label">
                            INGRESSOS
                        </span>

                        <div className="event-reservation__price">
                            <span>A partir de</span>
                            <strong>
                                R$ {formattedPrice}
                            </strong>
                        </div>

                        <div className="event-reservation__quantity">
                            <label htmlFor="quantity">
                                Quantidade
                            </label>

                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                max={event.capacity}
                                value={quantity}
                                onChange={(e) => {
                                    const value = Number(
                                        e.target.value,
                                    );

                                    if (value < 1) {
                                        setQuantity(1);
                                    } else if (
                                        value > event.capacity
                                    ) {
                                        setQuantity(event.capacity);
                                    } else {
                                        setQuantity(value);
                                    }
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            className="event-primary-button"
                            disabled={reserving}
                            onClick={async () => {
                                try {
                                    setReserving(true);
                                    setReservationError("");
                                    setPaymentError("");
                                    setPaid(false);
                                    setPaymentRejected(false);

                                    const reservation =
                                        await apiFetch<{
                                            id: string;
                                        }>("/reservations", {
                                            method: "POST",
                                            body: JSON.stringify({
                                                eventId: event.id,
                                                quantity,
                                            }),
                                        });

                                    setReservationId(
                                        reservation.id,
                                    );
                                } catch (error) {
                                    setReservationError(
                                        error instanceof Error
                                            ? error.message
                                            : "Não foi possível realizar a reserva.",
                                    );
                                } finally {
                                    setReserving(false);
                                }
                            }}
                        >
                            {reserving
                                ? "Reservando..."
                                : "Reservar ingressos"}
                        </button>

                        {reservationError && (
                            <p className="event-feedback event-feedback--error">
                                {reservationError}
                            </p>
                        )}

                        {reservationId && (
                            <div className="payment-area">
                                <div className="reservation-created">
                                    <span>✓</span>
                                    <div>
                                        <strong>
                                            Reserva criada
                                        </strong>
                                        <p>
                                            Agora escolha uma opção
                                            para simular o pagamento.
                                        </p>
                                    </div>
                                </div>

                                <div className="payment-actions">
                                    <button
                                        type="button"
                                        className="event-primary-button"
                                        disabled={paying}
                                        onClick={async () => {
                                            try {
                                                setPaying(true);
                                                setPaymentError("");
                                                setPaymentRejected(
                                                    false,
                                                );

                                                await apiFetch(
                                                    `/reservations/${reservationId}/pay`,
                                                    {
                                                        method: "POST",
                                                        body: JSON.stringify(
                                                            {
                                                                approved:
                                                                    true,
                                                            },
                                                        ),
                                                    },
                                                );

                                                setPaid(true);
                                            } catch (error) {
                                                setPaymentError(
                                                    error instanceof
                                                        Error
                                                        ? error.message
                                                        : "Não foi possível realizar o pagamento.",
                                                );
                                            } finally {
                                                setPaying(false);
                                            }
                                        }}
                                    >
                                        {paying
                                            ? "Processando..."
                                            : "Simular pagamento aprovado"}
                                    </button>

                                    <button
                                        type="button"
                                        className="event-secondary-button"
                                        disabled={paying}
                                        onClick={async () => {
                                            try {
                                                setPaying(true);
                                                setPaymentError("");
                                                setPaid(false);

                                                await apiFetch(
                                                    `/reservations/${reservationId}/pay`,
                                                    {
                                                        method: "POST",
                                                        body: JSON.stringify(
                                                            {
                                                                approved:
                                                                    false,
                                                            },
                                                        ),
                                                    },
                                                );

                                                setPaymentRejected(
                                                    true,
                                                );
                                            } catch (error) {
                                                setPaymentError(
                                                    error instanceof
                                                        Error
                                                        ? error.message
                                                        : "Não foi possível realizar o pagamento.",
                                                );
                                            } finally {
                                                setPaying(false);
                                            }
                                        }}
                                    >
                                        {paying
                                            ? "Processando..."
                                            : "Simular pagamento recusado"}
                                    </button>
                                </div>

                                {paymentError && (
                                    <p className="event-feedback event-feedback--error">
                                        {paymentError}
                                    </p>
                                )}

                                {paid && (
                                    <div className="payment-result payment-result--success">
                                        <strong>
                                            Pagamento realizado com
                                            sucesso!
                                        </strong>

                                        <p>
                                            Seus ingressos foram
                                            gerados.
                                        </p>

                                        <Link href="/meus-ingressos">
                                            Ver meus ingressos →
                                        </Link>
                                    </div>
                                )}

                                {paymentRejected && (
                                    <div className="payment-result payment-result--rejected">
                                        <strong>
                                            Pagamento recusado.
                                        </strong>

                                        <p>
                                            Sua reserva não foi
                                            aprovada. Você pode tentar
                                            novamente.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                </section>
            </div>
        </main>
    );
}

