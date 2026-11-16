import Cookies from "js-cookie";

const API_URL = "http://localhost:5000/api/auth";

interface LoginResponse {
  message: string;
  token: string;
}

export async function login(
  username: string,
  password: string
): Promise<void> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = (await response.json()) as LoginResponse;

  if (!response.ok) {
    throw new Error(data.message || "Ошибка авторизации");
  }

  Cookies.set("token", data.token, {
    expires: 2 / 24,
    sameSite: "strict",
  });
}

export function logout(): void {
  Cookies.remove("token");
}