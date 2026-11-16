
import type { Book } from "../types/Book";

const API_URL = "http://localhost:5000/api/books";

interface BookFilters {
  search?: string;
  category?: string;
  access?: string;
}

export async function getBooks(filters: BookFilters = {}): Promise<Book[]> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.access) params.set("access", filters.access);

  const response = await fetch(`${API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Не удалось загрузить список книг");
  }

  return response.json() as Promise<Book[]>;
}
