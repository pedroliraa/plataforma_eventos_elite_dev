"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Event = {
  id: string;
  title: string;
  type: "MOVIE" | "SHOW";
  date: string;
  location: string;
  capacity: number;
  price: number;
  source: "MANUAL" | "TMDB";
  externalId: string | null;
};

type EventForm = {
  title: string;
  type: "MOVIE" | "SHOW";
  date: string;
  location: string;
  capacity: string;
  price: string;
  source: "MANUAL" | "TMDB";
  externalId: string;
};

const emptyForm: EventForm = {
  title: "",
  type: "MOVIE",
  date: "",
  location: "",
  capacity: "",
  price: "",
  source: "MANUAL",
  externalId: "",
};

export default function OrganizerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await apiFetch<Event[]>("/events");
      setEvents(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os eventos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function handleChange(
    field: keyof EventForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleEdit(event: Event) {
    setEditingId(event.id);

    setForm({
      title: event.title,
      type: event.type,
      date: event.date.slice(0, 16),
      location: event.location,
      capacity: String(event.capacity),
      price: String(event.price),
      source: event.source,
      externalId: event.externalId ?? "",
    });

    setMessage("");
    setError("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setSaving(true);

      const body = {
        title: form.title,
        type: form.type,
        date: form.date,
        location: form.location,
        capacity: Number(form.capacity),
        price: Number(form.price),
        source: form.source,
        ...(form.externalId
          ? { externalId: form.externalId }
          : {}),
      };

      if (editingId) {
        await apiFetch<Event>(`/events/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });

        setMessage("Evento atualizado com sucesso.");
      } else {
        await apiFetch<Event>("/events", {
          method: "POST",
          body: JSON.stringify(body),
        });

        setMessage("Evento criado com sucesso.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadEvents();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o evento.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este evento?",
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await apiFetch(`/events/${id}`, {
        method: "DELETE",
      });

      setMessage("Evento excluído com sucesso.");

      if (editingId === id) {
        handleCancelEdit();
      }

      await loadEvents();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o evento.",
      );
    }
  }

  return (
    <main>
      <h1>Área do Organizer</h1>

      <section>
        <h2>
          {editingId ? "Editar evento" : "Criar evento"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Título</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) =>
                handleChange("title", e.target.value)
              }
              required
            />
          </div>

          <div>
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={form.type}
              onChange={(e) =>
                handleChange(
                  "type",
                  e.target.value as EventForm["type"],
                )
              }
            >
              <option value="MOVIE">Filme</option>
              <option value="SHOW">Show</option>
            </select>
          </div>

          <div>
            <label htmlFor="date">Data e hora</label>
            <input
              id="date"
              type="datetime-local"
              value={form.date}
              onChange={(e) =>
                handleChange("date", e.target.value)
              }
              required
            />
          </div>

          <div>
            <label htmlFor="location">Local</label>
            <input
              id="location"
              value={form.location}
              onChange={(e) =>
                handleChange("location", e.target.value)
              }
              required
            />
          </div>

          <div>
            <label htmlFor="capacity">Capacidade</label>
            <input
              id="capacity"
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) =>
                handleChange("capacity", e.target.value)
              }
              required
            />
          </div>

          <div>
            <label htmlFor="price">Preço</label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                handleChange("price", e.target.value)
              }
              required
            />
          </div>

          <div>
            <label htmlFor="source">Fonte</label>
            <select
              id="source"
              value={form.source}
              onChange={(e) =>
                handleChange(
                  "source",
                  e.target.value as EventForm["source"],
                )
              }
            >
              <option value="MANUAL">Manual</option>
              <option value="TMDB">TMDb</option>
              <option value="TICKETMASTER">
                Ticketmaster
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="externalId">
              ID externo (opcional)
            </label>
            <input
              id="externalId"
              value={form.externalId}
              onChange={(e) =>
                handleChange("externalId", e.target.value)
              }
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving
              ? "Salvando..."
              : editingId
                ? "Atualizar evento"
                : "Criar evento"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
            >
              Cancelar
            </button>
          )}
        </form>
      </section>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <section>
        <h2>Meus eventos</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : events.length === 0 ? (
          <p>Nenhum evento cadastrado.</p>
        ) : (
          events.map((event) => (
            <article key={event.id}>
              <h3>{event.title}</h3>

              <p>
                {event.type === "MOVIE" ? "Filme" : "Show"}
              </p>

              <p>
                {new Date(event.date).toLocaleString("pt-BR")}
              </p>

              <p>{event.location}</p>

              <p>
                Capacidade: {event.capacity}
              </p>

              <p>
                R$ {Number(event.price).toFixed(2)}
              </p>

              <button
                type="button"
                onClick={() => handleEdit(event)}
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => handleDelete(event.id)}
              >
                Excluir
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}