import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// SAFE COOKIE READER
const getCookie = (name) => {
  if (typeof document === "undefined") return null;

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
};

api.interceptors.request.use((config) => {

  if (typeof window !== "undefined") {

    const token =
      localStorage.getItem("token") ||
      getCookie("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }
  }

  return config;
});

export default api;