import { API } from "./api";

export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const register = (email, password) =>
  API.post("/auth/register", { email, password });
