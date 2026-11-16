
import { useEffect, useState } from "react";

import { getBooks } from "../api/books";
import type { Book } from "../types/Book";
import BookCard from "../components/BookCard";

function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [access, setAccess] = useState("Все");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "Все",
    "Антиутопия",
    "Роман",
    "Фэнтези",
  ];

  useEffect(() => {
    setLoading(true);
    setError("");

    getBooks({
      search,
      category: category === "Все" ? "" : category,
      access: access === "Все" ? "" : access,
    })
      .then((data) => {
        setBooks(data);
      })
      .catch(() => {
        setError("Не удалось загрузить список книг.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, category, access]);

  return (
    <div className="library-container">
      <header className="library-header">
        <h1>📚 Онлайн-библиотека</h1>
        <p>Найди книгу по душе</p>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по названию или автору..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={access}
          onChange={(event) => setAccess(event.target.value)}
        >
          <option value="Все">Все</option>
          <option value="free">Бесплатные</option>
          <option value="paid">Платные</option>
        </select>
      </div>

      <h2>Каталог книг</h2>

      {loading ? (
        <p>Загрузка книг...</p>
      ) : error ? (
        <p>{error}</p>
      ) : books.length === 0 ? (
        <p>Книги не найдены.</p>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BooksPage;
