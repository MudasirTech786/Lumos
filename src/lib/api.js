import axios from "axios";

console.log(
  "🔥 ENV API URL:",
  process.env.NEXT_PUBLIC_API_URL
);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// SAFE COOKIE READER
const getCookie = (name) => {

  if (typeof document === "undefined")
    return null;

  return document.cookie
    .split("; ")
    .find((row) =>
      row.startsWith(name + "=")
    )
    ?.split("=")[1];
};

// REQUEST DEBUG
api.interceptors.request.use((config) => {

  console.log("🚀 REQUEST URL:", config.baseURL + config.url);

  if (typeof window !== "undefined") {

    const token =
      localStorage.getItem("token") ||
      getCookie("token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

      console.log("🔑 TOKEN ATTACHED");
    }
  }

  return config;
});

// RESPONSE DEBUG
api.interceptors.response.use(

  (response) => {

    console.log("✅ RESPONSE:", response);

    return response;
  },

  (error) => {

    console.log("🔥 FULL ERROR:", error);

    console.log("🔥 RESPONSE:", error?.response);

    console.log("🔥 STATUS:", error?.response?.status);

    console.log("🔥 DATA:", error?.response?.data);

    console.log("🔥 MESSAGE:", error?.message);

    return Promise.reject(error);
  }
);

export default api;