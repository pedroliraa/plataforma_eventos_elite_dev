export interface CreateEventInput {
  title: string;
  type: "MOVIE" | "SHOW";
  date: Date;
  location: string;
  capacity: number;
  price: number;
  source: "MANUAL" | "TMDB" | "TICKETMASTER";
  externalId?: string | undefined;
}

export interface UpdateEventInput {
  title?: string | undefined;
  type?: "MOVIE" | "SHOW" | undefined;
  date?: Date | undefined;
  location?: string | undefined;
  capacity?: number | undefined;
  price?: number | undefined;
  source?: "MANUAL" | "TMDB" | "TICKETMASTER" | undefined;
  externalId?: string | null | undefined;
}