import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base URL para tu API (Render)
const API_URI = import.meta.env.VITE_APP_BASE_URL;
console.log("🌍 Base API:", import.meta.env.VITE_APP_BASE_URL);

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URI}/api`,
    credentials: "include", // 👈 Debe ir dentro de este objeto
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
});