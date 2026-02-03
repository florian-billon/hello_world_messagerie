"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `HTTP ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      if (res.status === 401) {
        errorMessage = "Authentication required. Please login.";
      }

      throw new Error(errorMessage);
    }

    if (res.status === 204) return {} as T;
    return await res.json();
  } catch (err) {
    if (err instanceof Error && err.message.includes("fetch failed")) {
      throw new Error("Unable to connect to server. Please check if the backend is running.");
    }
    throw err;
  }
}

export interface Server {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  server_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  server_id: string;
  channel_id: string;
  author_id: string;
  username: string;
  content: string;
  created_at: string;
  edited_at?: string;
}

export interface ServerMember {
  server_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export async function listServers(): Promise<Server[]> {
  return fetchApi<Server[]>("/servers");
}

export async function createServer(name: string): Promise<Server> {
  return fetchApi<Server>("/servers", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function listChannels(serverId: string): Promise<Channel[]> {
  return fetchApi<Channel[]>(`/servers/${serverId}/channels`);
}

export async function createChannel(serverId: string, name: string): Promise<Channel> {
  return fetchApi<Channel>(`/servers/${serverId}/channels`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function listMembers(serverId: string): Promise<ServerMember[]> {
  return fetchApi<ServerMember[]>(`/servers/${serverId}/members`);
}

export async function listMessages(channelId: string, limit = 50): Promise<Message[]> {
  return fetchApi<Message[]>(`/channels/${channelId}/messages?limit=${limit}`);
}

export async function sendMessage(channelId: string, content: string): Promise<Message> {
  return fetchApi<Message>(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

