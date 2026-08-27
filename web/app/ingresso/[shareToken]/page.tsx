"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { apiFetch } from "@/lib/api";

type Ticket = {
  id: string;
  qrCode: string;
  status: "VALID" | "USED" | "CANCELLED";
  shareToken: string;
  reservation: {
    event: {
      title: string;
      date: string;
      location: string;
    };
  };
};

export default function SharedTicketPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await apiFetch<Ticket>(
          `/tickets/share/${shareToken}`,
        );

        setTicket(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o ingresso.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [shareToken]);

  if (loading) {
    return <main>Carregando ingresso...</main>;
  }

  if (error || !ticket) {
    return (
      <main>
        <h1>Ingresso não encontrado</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{ticket.reservation.event.title}</h1>

      <p>
        {new Date(
          ticket.reservation.event.date,
        ).toLocaleDateString("pt-BR")}
      </p>

      <p>{ticket.reservation.event.location}</p>

      <p>Status: {ticket.status}</p>

      <QRCodeSVG
        value={ticket.qrCode}
        size={220}
      />
    </main>
  );
}