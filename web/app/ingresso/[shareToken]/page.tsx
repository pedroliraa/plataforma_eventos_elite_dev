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
    return (
      <main className="shared-ticket-page">
        <div className="shared-ticket-shell">
          <p className="shared-ticket-status">
            Carregando ingresso...
          </p>
        </div>
      </main>
    );
  }

  if (error || !ticket) {
    return (
      <main className="shared-ticket-page">
        <div className="shared-ticket-shell">
          <div className="shared-ticket-error">
            <span className="shared-ticket-eyebrow">
              ELITE EVENTS
            </span>

            <h1>Ingresso não encontrado</h1>

            <p>
              {error ||
                "Este ingresso não existe ou não está mais disponível."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const event = ticket.reservation.event;

  return (
    <main className="shared-ticket-page">
      <div className="shared-ticket-shell">
        <header className="shared-ticket-header">
          <span>ELITE</span>
          <strong>EVENTS</strong>
        </header>

        <p className="shared-ticket-intro">
          INGRESSO DIGITAL
        </p>

        <article className="shared-ticket">
          <div className="shared-ticket-top">
            <div>
              <span className="shared-ticket-type">
                {ticket.status === "VALID"
                  ? "ENTRADA CONFIRMADA"
                  : "INGRESSO"}
              </span>

              <h1>{event.title}</h1>
            </div>

            <div
              className={`shared-ticket-status shared-ticket-status--${ticket.status.toLowerCase()}`}
            >
              <span />
              {getStatusLabel(ticket.status)}
            </div>
          </div>

          <div className="shared-ticket-info">
            <div>
              <span>Data</span>
              <strong>{formatDate(event.date)}</strong>
            </div>

            <div>
              <span>Horário</span>
              <strong>{formatTime(event.date)}</strong>
            </div>

            <div>
              <span>Local</span>
              <strong>{event.location}</strong>
            </div>
          </div>

          <div className="shared-ticket-divider">
            <span />
            <span />
          </div>

          <div className="shared-ticket-qr">
            <div className="shared-ticket-qr__box">
              <QRCodeSVG
                value={ticket.qrCode}
                size={220}
                bgColor="#ffffff"
                fgColor="#111111"
                level="M"
              />
            </div>

            <strong>Apresente este QR Code na entrada</strong>

            <p>
              O ingresso será validado no acesso ao evento.
            </p>
          </div>

          <footer className="shared-ticket-footer">
            <span>ELITE EVENTS</span>
            <span>INGRESSO DIGITAL</span>
          </footer>
        </article>

        <p className="shared-ticket-note">
          Este ingresso foi compartilhado através da Elite Events.
        </p>
      </div>
    </main>
  );
}

