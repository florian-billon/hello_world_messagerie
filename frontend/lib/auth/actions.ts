"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    return { error: data.error || "Invalid credentials" };
  }

  const data = await res.json();

  // Stocker le token dans un cookie accessible au client
  const cookieStore = await cookies();
  cookieStore.set("token", data.token, {
    httpOnly: false, // Accessible au client pour les appels API
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 heures
    path: "/",
  });

  return { user: data.user, token: data.token };
}

export async function signup(username: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    return { error: data.error || "Registration failed" };
  }

  const data = await res.json();

  if (!data.token) {
    return { error: "No token received from server" };
  }

  // Stocker le token dans un cookie accessible au client
  const cookieStore = await cookies();
  cookieStore.set("token", data.token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return { user: data.user, token: data.token };
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    // Appeler le backend pour logout
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
  }

  // Supprimer le cookie
  cookieStore.delete("token");
  redirect("/login");
}

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  return res.json();
}

export async function clearToken() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}

