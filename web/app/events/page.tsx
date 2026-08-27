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

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return <main>Carregando eventos...</main>;
  }

  if (error) {
    return <main>{error}</main>;
  }

  return (
    <main>
      <h1>Eventos</h1>

      {events.length === 0 ? (
        <p>Nenhum evento disponível.</p>
      ) : (
        <section>
          {events.map((event) => (
            <article key={event.id}>
              <span>
                {event.type === "MOVIE" ? "Filme" : "Show"}
              </span>

              <h2>{event.title}</h2>

              <p>
                {new Date(event.date).toLocaleDateString("pt-BR")}
              </p>

              <p>{event.location}</p>

              <p>
                R${" "}
                {Number(event.price).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>

              <Link href={`/events/${event.id}`}>
                Ver evento
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}