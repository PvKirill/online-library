
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getBooks } from "../api/books";
import { bookContent } from "../api/bookContent";
import type { Book } from "../types/Book";

import BookReader from "../components/BookReader";
import BookCard from "../components/BookCard";

function BookPage() {
  const { id } = useParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBooks()
      .then((data) => {
        setBooks(data);
      })
      .catch(() => {
        setError("Не удалось загрузить информацию о книге.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="library-container">
        <p>Загрузка книги...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-container">
        <p>{error}</p>
        <Link to="/">Вернуться в каталог</Link>
      </div>
    );
  }

  const book = books.find((item) => item.id === Number(id));

  if (!book) {
    return (
      <div className="library-container">
        <h1>Книга не найдена</h1>
        <Link to="/">Вернуться в каталог</Link>
      </div>
    );
  }

  const similarBooks = books.filter(
    (item) =>
      item.category === book.category &&
      item.id !== book.id
  );

  return (
    <div className="library-container">
      <Link to="/" className="back-link">
        ← Вернуться в каталог
      </Link>

      <div className="book-details">
        <div className="book-details-icon">📖</div>

        <span className={`access-label ${book.access}`}>
          {book.access === "free" ? "Бесплатно" : "Платный доступ"}
        </span>

        <h1>{book.title}</h1>

        <p className="book-details-author">
          Автор: {book.author}
        </p>

        <p>Категория: {book.category}</p>

        <h3>Описание книги</h3>
        <p>{book.description}</p>

        <BookReader
          book={book}
          pages={bookContent[book.id] || []}
        />

        <section className="similar-books">
          <h2>Похожие книги</h2>

          {similarBooks.length === 0 ? (
            <p>Похожих книг пока нет.</p>
          ) : (
            <div className="books-grid">
              {similarBooks.map((item) => (
                <BookCard key={item.id} book={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BookPage;
