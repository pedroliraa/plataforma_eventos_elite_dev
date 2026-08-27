"use client";

import { FormEvent, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
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

type Movie = {
    id: number;
    title: string;
    release_date?: string;
    poster_path?: string | null;
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

export default function OrganizerPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [form, setForm] = useState<EventForm>(emptyForm);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [movies, setMovies] = useState<Movie[]>([]);
    const [movieSearch, setMovieSearch] = useState("");
    const [searchingMovies, setSearchingMovies] = useState(false);

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

    useEffect(() => {
        if (
            form.type !== "MOVIE" ||
            form.source !== "TMDB" ||
            movieSearch.trim().length < 2
        ) {
            setMovies([]);
            setSearchingMovies(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setSearchingMovies(true);

                const data = await apiFetch<Movie[]>(
                    `/events/catalog/search?query=${encodeURIComponent(
                        movieSearch,
                    )}`,
                );

                setMovies(data);
            } catch {
                setMovies([]);
            } finally {
                setSearchingMovies(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [movieSearch, form.type, form.source]);

    function handleChange(
        field: keyof EventForm,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function handleTypeChange(value: EventForm["type"]) {
        if (value === "SHOW") {
            setMovieSearch("");
            setMovies([]);

            setForm((current) => ({
                ...current,
                type: value,
                source: "MANUAL",
                externalId: "",
            }));

            return;
        }

        setForm((current) => ({
            ...current,
            type: value,
        }));
    }

    function handleSourceChange(value: EventForm["source"]) {
        setMovieSearch("");
        setMovies([]);

        setForm((current) => ({
            ...current,
            source: value,
            externalId:
                value === "MANUAL" ? current.externalId : "",
        }));
    }

    function handleMovieSelect(movie: Movie) {
        setMovieSearch(movie.title);
        setMovies([]);

        setForm((current) => ({
            ...current,
            title: movie.title,
            source: "TMDB",
            externalId: String(movie.id),
        }));
    }

    function openCreateForm() {
        setForm(emptyForm);
        setEditingId(null);
        setMovieSearch("");
        setMovies([]);
        setMessage("");
        setError("");
        setShowForm(true);
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

        setMovieSearch(event.source === "TMDB" ? event.title : "");
        setMovies([]);

        setMessage("");
        setError("");
        setShowForm(true);
    }

    function handleCloseForm() {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        setMovieSearch("");
        setMovies([]);
        setError("");
    }

    async function handleSubmit(
        e: FormEvent<HTMLFormElement>,
    ) {
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

            handleCloseForm();
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

    function handleCancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
        setMovieSearch("");
        setMovies([]);
        setMessage("");
        setError("");
    }

    function handleDelete(id: string) {
        setDeletingId(id);
    }

    async function confirmDelete() {
        if (!deletingId) {
            return;
        }

        const eventId = deletingId;

        setDeleting(true);
        setMessage("");
        setError("");

        try {
            await apiFetch(`/events/${eventId}`, {
                method: "DELETE",
            });

            setMessage("Evento excluído com sucesso.");

            if (editingId === eventId) {
                handleCloseForm();
            }

            setDeletingId(null);

            await loadEvents();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir o evento.",
            );
        } finally {
            setDeleting(false);
        }
    }


    return (
        <ProtectedRoute allowedRoles={["ORGANIZER"]}>
            <main className="organizer-page">
                <div className="organizer-container">

                    <section className="organizer-heading">
                        <div>
                            <span className="organizer-eyebrow">
                                ÁREA DO ORGANIZER
                            </span>

                            <h1>Meus eventos</h1>

                            <p>
                                Crie, organize e acompanhe os eventos
                                disponíveis na plataforma.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="organizer-primary-button"
                            onClick={openCreateForm}
                        >
                            + Novo evento
                        </button>
                    </section>

                    {message && (
                        <div className="organizer-feedback organizer-feedback--success">
                            {message}
                        </div>
                    )}

                    {error && !showForm && (
                        <div className="organizer-feedback organizer-feedback--error">
                            {error}
                        </div>
                    )}

                    <section className="organizer-events-section">
                        <div className="organizer-section-header">
                            <div>
                                <span>SEUS EVENTOS</span>
                                <h2>Programação</h2>
                            </div>

                            <small>
                                {events.length}{" "}
                                {events.length === 1
                                    ? "evento"
                                    : "eventos"}
                            </small>
                        </div>

                        {loading ? (
                            <div className="organizer-empty">
                                <p>Carregando eventos...</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="organizer-empty">
                                <h3>Você ainda não criou nenhum evento</h3>

                                <p>
                                    Comece criando seu primeiro evento.
                                </p>

                                <button
                                    type="button"
                                    className="organizer-secondary-button"
                                    onClick={openCreateForm}
                                >
                                    Criar evento
                                </button>
                            </div>
                        ) : (
                            <div className="organizer-events-grid">
                                {events.map((event) => (
                                    <article
                                        key={event.id}
                                        className="organizer-event-card"
                                    >
                                        <div className="organizer-event-card__top">
                                            <span>
                                                {event.type === "MOVIE"
                                                    ? "FILME"
                                                    : "SHOW"}
                                            </span>

                                            <span>
                                                {event.source === "TMDB"
                                                    ? "TMDb"
                                                    : "Manual"}
                                            </span>
                                        </div>

                                        <div className="organizer-event-card__main">
                                            <h3>{event.title}</h3>

                                            <div>
                                                <p>
                                                    {formatDate(event.date)}
                                                </p>

                                                <p>
                                                    {formatTime(event.date)} ·{" "}
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="organizer-event-card__bottom">
                                            <div>
                                                <small>Preço</small>

                                                <strong>
                                                    R${" "}
                                                    {Number(event.price).toLocaleString(
                                                        "pt-BR",
                                                        {
                                                            minimumFractionDigits: 2,
                                                        },
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="organizer-event-actions">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(event)
                                                    }
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(event.id)
                                                    }
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {showForm && (
                    <div
                        className="organizer-modal-backdrop"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                handleCloseForm();
                            }
                        }}
                    >
                        <section
                            className="organizer-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="organizer-modal-title"
                        >
                            <div className="organizer-modal__header">
                                <div>
                                    <span>
                                        {editingId
                                            ? "EDITAR EVENTO"
                                            : "NOVO EVENTO"}
                                    </span>

                                    <h2 id="organizer-modal-title">
                                        {editingId
                                            ? "Editar evento"
                                            : "Criar evento"}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="organizer-modal__close"
                                    onClick={handleCloseForm}
                                    aria-label="Fechar"
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                className="organizer-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="organizer-form__row">
                                    <div>
                                        <label htmlFor="type">
                                            Tipo
                                        </label>

                                        <select
                                            id="type"
                                            value={form.type}
                                            onChange={(e) =>
                                                handleTypeChange(
                                                    e.target.value as EventForm["type"],
                                                )
                                            }
                                        >
                                            <option value="MOVIE">
                                                Filme
                                            </option>

                                            <option value="SHOW">
                                                Show
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="source">
                                            Fonte
                                        </label>

                                        <select
                                            id="source"
                                            value={form.source}
                                            onChange={(e) =>
                                                handleSourceChange(
                                                    e.target.value as EventForm["source"],
                                                )
                                            }
                                        >
                                            <option value="MANUAL">
                                                Manual
                                            </option>

                                            {form.type === "MOVIE" && (
                                                <option value="TMDB">
                                                    TMDb
                                                </option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {form.type === "MOVIE" &&
                                    form.source === "TMDB" ? (
                                    <div className="organizer-autocomplete">
                                        <label htmlFor="movieSearch">
                                            Buscar filme
                                        </label>

                                        <input
                                            id="movieSearch"
                                            value={movieSearch}
                                            onChange={(e) =>
                                                setMovieSearch(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Digite o nome do filme..."
                                            autoComplete="off"
                                        />

                                        {searchingMovies && (
                                            <p className="organizer-search-status">
                                                Buscando filmes...
                                            </p>
                                        )}

                                        {!searchingMovies &&
                                            movieSearch.trim().length >= 2 &&
                                            movies.length === 0 && (
                                                <p className="organizer-search-status">
                                                    Nenhum filme encontrado.
                                                </p>
                                            )}

                                        {movies.length > 0 && (
                                            <ul className="organizer-movie-results">
                                                {movies.map((movie) => (
                                                    <li key={movie.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleMovieSelect(
                                                                    movie,
                                                                )
                                                            }
                                                        >
                                                            <strong>
                                                                {movie.title}
                                                            </strong>

                                                            {movie.release_date && (
                                                                <span>
                                                                    {movie.release_date.slice(
                                                                        0,
                                                                        4,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label htmlFor="title">
                                            Título
                                        </label>

                                        <input
                                            id="title"
                                            value={form.title}
                                            onChange={(e) =>
                                                handleChange(
                                                    "title",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="date">
                                        Data e hora
                                    </label>

                                    <input
                                        id="date"
                                        type="datetime-local"
                                        value={form.date}
                                        onChange={(e) =>
                                            handleChange(
                                                "date",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location">
                                        Local
                                    </label>

                                    <input
                                        id="location"
                                        value={form.location}
                                        onChange={(e) =>
                                            handleChange(
                                                "location",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="organizer-form__row">
                                    <div>
                                        <label htmlFor="capacity">
                                            Capacidade
                                        </label>

                                        <input
                                            id="capacity"
                                            type="number"
                                            min="1"
                                            value={form.capacity}
                                            onChange={(e) =>
                                                handleChange(
                                                    "capacity",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="price">
                                            Preço
                                        </label>

                                        <input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={(e) =>
                                                handleChange(
                                                    "price",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                {form.source === "TMDB" ? (
                                    <div>
                                        <label htmlFor="externalId">
                                            ID externo
                                        </label>

                                        <input
                                            id="externalId"
                                            value={form.externalId}
                                            readOnly
                                            placeholder="Selecione um filme"
                                        />

                                        <small className="organizer-form__hint">
                                            Preenchido automaticamente
                                            pelo TMDb.
                                        </small>
                                    </div>
                                ) : (
                                    <div>
                                        <label htmlFor="externalId">
                                            ID externo
                                        </label>

                                        <input
                                            id="externalId"
                                            value={form.externalId}
                                            onChange={(e) =>
                                                handleChange(
                                                    "externalId",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="organizer-feedback organizer-feedback--error">
                                        {error}
                                    </div>
                                )}

                                <div className="organizer-form__actions">
                                    <button
                                        type="button"
                                        className="organizer-cancel-button"
                                        onClick={handleCloseForm}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="organizer-primary-button"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Salvando..."
                                            : editingId
                                                ? "Salvar alterações"
                                                : "Criar evento"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
                {deletingId && (
                    <div className="delete-modal__overlay">
                        <div className="delete-modal">
                            <span className="delete-modal__eyebrow">
                                EXCLUIR EVENTO
                            </span>

                            <h2>Excluir este evento?</h2>

                            <p>
                                Essa ação não poderá ser desfeita. O evento será
                                removido da sua lista.
                            </p>

                            {error && (
                                <div className="delete-modal__error">
                                    {error}
                                </div>
                            )}

                            <div className="delete-modal__actions">
                                <button
                                    type="button"
                                    className="delete-modal__cancel"
                                    disabled={deleting}
                                    onClick={() => {
                                        setDeletingId(null);
                                        setError("");
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="delete-modal__confirm"
                                    disabled={deleting}
                                    onClick={confirmDelete}
                                >
                                    {deleting
                                        ? "Excluindo..."
                                        : "Excluir evento"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}