"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, removeToken, UserRole } from "@/lib/auth";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getUser();

    if (!user) {
      removeToken();
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace("/events");
      return;
    }

    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) {
    return <main>Carregando...</main>;
  }

  return <>{children}</>;
}