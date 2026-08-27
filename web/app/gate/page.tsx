"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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

export default function GatePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <main>
      <h1>Validação de ingressos</h1>

      <div>
        <label htmlFor="event">Evento</label>

        <select
          id="event"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">Selecione um evento</option>

          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="qrCode">QR Code</label>

        <textarea
          id="qrCode"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Cole o conteúdo do QR Code"
          rows={5}
        />
      </div>

      <button
        type="button"
        onClick={handleValidate}
        disabled={loading}
      >
        {loading ? "Validando..." : "Validar ingresso"}
      </button>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </main>
  );
}