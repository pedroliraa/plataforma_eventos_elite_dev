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
        return <main>Carregando evento...</main>;
    }

    if (error || !event) {
        return <main>{error || "Evento não encontrado."}</main>;
    }

    return (
        <main>
            <Link href="/events">← Voltar para eventos</Link>

            <h1>{event.title}</h1>

            <p>
                {event.type === "MOVIE" ? "Filme" : "Show"}
            </p>

            <p>
                Data:{" "}
                {new Date(event.date).toLocaleDateString("pt-BR")}
            </p>

            <p>Local: {event.location}</p>

            <p>
                Preço: R${" "}
                {Number(event.price).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                })}
            </p>

            <p>Capacidade: {event.capacity} pessoas</p>

            <div>
                <label htmlFor="quantity">
                    Quantidade de ingressos
                </label>

                <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={event.capacity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />

                <button
                    type="button"
                    disabled={reserving}
                    onClick={async () => {
                        try {
                            setReserving(true);
                            setReservationError("");

                            const reservation = await apiFetch<{
                                id: string;
                            }>("/reservations", {
                                method: "POST",
                                body: JSON.stringify({
                                    eventId: event.id,
                                    quantity,
                                }),
                            });

                            setReservationId(reservation.id);
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
                    {reserving ? "Reservando..." : "Reservar ingresso"}
                </button>

                {reservationError && (
                    <p>{reservationError}</p>
                )}

                {reservationId && (
                    <div>
                        <p>Reserva criada com sucesso!</p>

                        <button
                            type="button"
                            disabled={paying}
                            onClick={async () => {
                                try {
                                    setPaying(true);
                                    setPaymentError("");
                                    setPaymentRejected(false);

                                    await apiFetch(
                                        `/reservations/${reservationId}/pay`,
                                        {
                                            method: "POST",
                                            body: JSON.stringify({
                                                approved: true,
                                            }),
                                        },
                                    );

                                    setPaid(true);
                                } catch (error) {
                                    setPaymentError(
                                        error instanceof Error
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
                            disabled={paying}
                            onClick={async () => {
                                try {
                                    setPaying(true);
                                    setPaymentError("");
                                    setPaymentRejected(false);

                                    await apiFetch(
                                        `/reservations/${reservationId}/pay`,
                                        {
                                            method: "POST",
                                            body: JSON.stringify({
                                                approved: false,
                                            }),
                                        },
                                    );

                                    setPaymentRejected(true);
                                } catch (error) {
                                    setPaymentError(
                                        error instanceof Error
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

                        {paymentError && (
                            <p>{paymentError}</p>
                        )}

                        {paid && (
                            <div>
                                <p>
                                    Pagamento realizado com sucesso!
                                    Seus ingressos foram gerados.
                                </p>

                                <Link href="/meus-ingressos">
                                    Ver meus ingressos
                                </Link>
                            </div>
                        )}

                        {paymentRejected && (
                            <div>
                                <p>
                                    Pagamento recusado.
                                </p>

                                <p>
                                    Sua reserva não foi aprovada.
                                    Tente novamente.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}