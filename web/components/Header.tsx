"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, removeToken, type User } from "@/lib/auth";

export default function Header() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function updateUser() {
      setUser(getUser());
    }

    updateUser();
    setMounted(true);

    window.addEventListener("auth-change", updateUser);

    return () => {
      window.removeEventListener("auth-change", updateUser);
    };
  }, []);

  function handleLogout() {
    removeToken();
    localStorage.removeItem("user");

    setUser(null);

    window.dispatchEvent(new Event("auth-change"));

    router.push("/login");
  }

  return (
    <header className="site-header">
      <nav className="site-header__nav">
        <Link
          href="/events"
          className="site-header__logo"
        >
          Elite <span>Events</span>
        </Link>

        {mounted && (
          <div className="site-header__links">
            <Link href="/events">
              Eventos
            </Link>

            {!user && (
              <Link
                href="/login"
                className="site-header__login"
              >
                Entrar
              </Link>
            )}

            {user?.role === "CUSTOMER" && (
              <Link href="/meus-ingressos">
                Meus ingressos
              </Link>
            )}

            {user?.role === "ORGANIZER" && (
              <Link href="/organizer">
                Meus eventos
              </Link>
            )}

            {user?.role === "GATE" && (
              <Link href="/gate">
                Validar ingresso
              </Link>
            )}

            {user && (
              <button
                type="button"
                className="site-header__logout"
                onClick={handleLogout}
              >
                Sair
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}