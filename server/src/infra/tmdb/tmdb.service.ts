import axios from "axios";
import { env } from "../../config/env.js";

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${env.TMDB_API_TOKEN}`,
  },
});

export async function searchMovies(query: string) {
  const response = await tmdb.get("/search/movie", {
    params: {
      query,
      language: "pt-BR",
      include_adult: false,
    },
  });

  return response.data.results;
}