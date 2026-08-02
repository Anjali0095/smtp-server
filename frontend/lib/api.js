const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("smtp_token");
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("smtp_token", token);
  else localStorage.removeItem("smtp_token");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("smtp_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem("smtp_user", JSON.stringify(user));
  else localStorage.removeItem("smtp_user");
}

export function logout() {
  setToken(null);
  setUser(null);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }

  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  listDomains: () => request("/domains"),
  createDomain: (payload) => request("/domains", { method: "POST", body: payload }),
  getDomain: (id) => request(`/domains/${id}`),
  updateDomain: (id, payload) => request(`/domains/${id}`, { method: "PUT", body: payload }),
  deleteDomain: (id) => request(`/domains/${id}`, { method: "DELETE" }),

  listRecords: (domainId) => request(`/domains/${domainId}/records`),
  createRecord: (domainId, payload) =>
    request(`/domains/${domainId}/records`, { method: "POST", body: payload }),
  updateRecord: (domainId, recordId, payload) =>
    request(`/domains/${domainId}/records/${recordId}`, { method: "PUT", body: payload }),
  deleteRecord: (domainId, recordId) =>
    request(`/domains/${domainId}/records/${recordId}`, { method: "DELETE" }),
};
