"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/auth";

interface RegisterResponse {
user: User;
}

export default function RegisterPage() {
const router = useRouter();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
//const [role, setRole] = useState<User["role"]>("CUSTOMER");

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setError("");
setLoading(true);

try {
  await apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      //role: "CUSTOMER",
    }),
  });

  router.push("/login");
} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : "Não foi possível criar a conta.",
  );
} finally {
  setLoading(false);
}


}

return ( <main> <h1>Criar conta</h1>

  <form onSubmit={handleSubmit}>
    <div>
      <label htmlFor="name">Nome</label>

      <input
        id="name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        minLength={2}
      />
    </div>

    <div>
      <label htmlFor="email">E-mail</label>

      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
    </div>

    <div>
      <label htmlFor="password">Senha</label>

      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={6}
      />
    </div>

    {error && <p>{error}</p>}

    <button type="submit" disabled={loading}>
      {loading ? "Criando..." : "Criar conta"}
    </button>
  </form>

  <p>
    Já tem uma conta?{" "}
    <a href="/login">Entrar</a>
  </p>
</main>


);
}
