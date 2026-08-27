"use client";

import { useEffect, useState } from "react";
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await apiFetch<Event[]>("/events");
        setEvents(data);
      } catch {
        setError("Não foi possível carregar os eventos.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const totalPages = Math.ceil(events.length / 4);

  const visibleEvents = events.slice(
    page * 4,
    page * 4 + 4,
  );

  function nextPage() {
    if (page < totalPages - 1) {
      setPage((current) => current + 1);
    }
  }

  function previousPage() {
    if (page > 0) {
      setPage((current) => current - 1);
    }
  }

  if (loading) {
    return (
      <main className="events-page">
        <div className="events-container">
          <p className="events-status">
            Carregando eventos...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="events-page">
        <div className="events-container">
          <div className="events-empty">
            <h2>Não foi possível carregar os eventos</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="events-page">
      <div className="events-container">
        <header className="events-header">
          <div>
            <span className="events-header__eyebrow">
              EVENTOS
            </span>

            <h1>Próximos eventos</h1>

            <p>
              Filmes, shows e outros eventos disponíveis.
            </p>
          </div>

          {events.length > 0 && (
            <span className="events-count">
              {events.length}{" "}
              {events.length === 1 ? "evento" : "eventos"}
            </span>
          )}
        </header>

        {events.length === 0 ? (
          <div className="events-empty">
            <h2>Nenhum evento disponível</h2>
            <p>
              Ainda não há eventos cadastrados.
            </p>
          </div>
        ) : (
          <>
            <div className="events-carousel">
              <button
                type="button"
                className="events-carousel__button events-carousel__button--previous"
                onClick={previousPage}
                disabled={page === 0}
                aria-label="Eventos anteriores"
              >
                ‹
              </button>

              <div className="events-grid">
                {visibleEvents.map((event) => (
                  <article
                    key={event.id}
                    className="event-card"
                  >
                    <div className="event-card__top">
                      <span className="event-card__type">
                        {event.type === "MOVIE"
                          ? "Filme"
                          : "Show"}
                      </span>

                      <span className="event-card__date">
                        {formatDate(event.date)}
                      </span>
                    </div>

                    <div className="event-card__content">
                      <h2>{event.title}</h2>

                      <div className="event-card__details">
                        <span>
                          {formatTime(event.date)}
                        </span>

                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="event-card__footer">
                      <div>
                        <span className="event-card__price-label">
                          Ingressos a partir de
                        </span>

                        <strong>
                          R${" "}
                          {Number(
                            event.price,
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </div>

                      <Link
                        href={`/events/${event.id}`}
                        className="event-card__link"
                      >
                        Ver evento
                        <span aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <button
                type="button"
                className="events-carousel__button events-carousel__button--next"
                onClick={nextPage}
                disabled={page === totalPages - 1}
                aria-label="Próximos eventos"
              >
                ›
              </button>
            </div>

            {totalPages > 1 && (
              <div
                className="events-carousel__indicators"
                aria-label="Página de eventos"
              >
                {Array.from(
                  { length: totalPages },
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={
                        index === page
                          ? "active"
                          : ""
                      }
                      onClick={() => setPage(index)}
                      aria-label={`Página ${index + 1}`}
                    />
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
