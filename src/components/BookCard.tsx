
import { Link } from "react-router-dom";
import type { Book } from "../types/Book";

interface BookCardProps {
  book: Book;
}

function BookCard({ book }: BookCardProps) {
  return (
    <div className="book-card">
      <div className="book-icon">📖</div>

      <span className={`access-label ${book.access}`}>
        {book.access === "free" ? "Бесплатно" : "Платный доступ"}
      </span>

      <h2>{book.title}</h2>

      <p className="book-author">{book.author}</p>

      <p className="book-category">{book.category}</p>

      <p className="book-description">{book.description}</p>

      <Link className="details-button" to={`/books/${book.id}`}>
        Подробнее →
      </Link>
    </div>
  );
}

export default BookCard;
