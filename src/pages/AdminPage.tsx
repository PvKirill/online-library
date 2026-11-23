import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { logout } from "../api/auth";

interface PurchaseRequest {
  id: number;
  book_id: number;
  book_title: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  access: "free" | "paid";
}

function AdminPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Данные новой книги
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<"free" | "paid">("free");

  const [addingBook, setAddingBook] = useState(false);
  const [bookMessage, setBookMessage] = useState("");

  // Данные редактируемой книги
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [savingBook, setSavingBook] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = Cookies.get("token");

        const [requestsResponse, booksResponse] = await Promise.all([
          fetch("http://localhost:5000/api/purchase-requests", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/books"),
        ]);

        if (!requestsResponse.ok) {
          throw new Error("Не удалось загрузить заявки");
        }

        if (!booksResponse.ok) {
          throw new Error("Не удалось загрузить каталог книг");
        }

        const requestsData: PurchaseRequest[] =
          await requestsResponse.json();

        const booksData: Book[] = await booksResponse.json();

        setRequests(requestsData);
        setBooks(booksData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Произошла ошибка"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Добавление новой книги
  async function handleAddBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAddingBook(true);
    setBookMessage("");

    try {
      const token = Cookies.get("token");

      const response = await fetch("http://localhost:5000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          author,
          category,
          description,
          access,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось добавить книгу");
      }

      setBooks((prev) => [...prev, data.book]);
      setBookMessage("Книга успешно добавлена!");

      setTitle("");
      setAuthor("");
      setCategory("");
      setDescription("");
      setAccess("free");
    } catch (error) {
      setBookMessage(
        error instanceof Error
          ? error.message
          : "Ошибка добавления книги"
      );
    } finally {
      setAddingBook(false);
    }
  }

  // Открытие формы редактирования
  function handleEditBook(book: Book) {
    setEditingBook({ ...book });
  }

  // Сохранение изменений книги
  async function handleUpdateBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingBook) return;

    setSavingBook(true);

    try {
      const token = Cookies.get("token");

      const response = await fetch(
        `http://localhost:5000/api/books/${editingBook.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editingBook.title,
            author: editingBook.author,
            category: editingBook.category,
            description: editingBook.description,
            access: editingBook.access,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось изменить книгу");
      }

      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingBook.id ? data.book : book
        )
      );

      setEditingBook(null);
      alert("Книга успешно обновлена!");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Ошибка редактирования книги"
      );
    } finally {
      setSavingBook(false);
    }
  }

  // Удаление книги
  async function handleDeleteBook(id: number) {
    const confirmed = window.confirm(
      "Вы действительно хотите удалить эту книгу?"
    );

    if (!confirmed) return;

    try {
      const token = Cookies.get("token");

      const response = await fetch(
        `http://localhost:5000/api/books/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось удалить книгу");
      }

      setBooks((prev) => prev.filter((book) => book.id !== id));
      alert("Книга успешно удалена");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Ошибка удаления книги"
      );
    }
  }

  // Удаление заявки
  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Вы действительно хотите удалить эту заявку?"
    );

    if (!confirmed) return;

    try {
      const token = Cookies.get("token");

      const response = await fetch(
        `http://localhost:5000/api/purchase-requests/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось удалить заявку");
      }

      setRequests((prev) =>
        prev.filter((request) => request.id !== id)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Ошибка удаления заявки"
      );
    }
  }

  return (
    <div className="admin-container">
      <h1>Панель администратора</h1>

      <button onClick={handleLogout}>
        Выйти
      </button>

      <h2>Добавление книги</h2>

      <form onSubmit={handleAddBook}>
        <div>
          <label>Название книги</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Автор</label>
          <br />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Категория</label>
          <br />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Описание</label>
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Тип доступа</label>
          <br />
          <select
            value={access}
            onChange={(e) =>
              setAccess(e.target.value as "free" | "paid")
            }
          >
            <option value="free">Бесплатная</option>
            <option value="paid">Платная</option>
          </select>
        </div>

        <br />

        <button type="submit" disabled={addingBook}>
          {addingBook ? "Добавление..." : "Добавить книгу"}
        </button>
      </form>

      {bookMessage && <p>{bookMessage}</p>}

      <hr />

      <h2>Каталог книг</h2>

      {loading && <p>Загрузка книг...</p>}

      {!loading && books.length === 0 && (
        <p>Книг пока нет.</p>
      )}

      {!loading && books.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Название</th>
              <th>Автор</th>
              <th>Категория</th>
              <th>Доступ</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>
                  {book.access === "free" ? "Бесплатная" : "Платная"}
                </td>
                <td>
                  <button onClick={() => handleEditBook(book)}>
                    Редактировать
                  </button>

                  {" "}

                  <button onClick={() => handleDeleteBook(book.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingBook && (
        <>
          <hr />

          <h2>Редактирование книги</h2>

          <form onSubmit={handleUpdateBook}>
            <div>
              <label>Название книги</label>
              <br />
              <input
                type="text"
                value={editingBook.title}
                onChange={(e) =>
                  setEditingBook({
                    ...editingBook,
                    title: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label>Автор</label>
              <br />
              <input
                type="text"
                value={editingBook.author}
                onChange={(e) =>
                  setEditingBook({
                    ...editingBook,
                    author: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label>Категория</label>
              <br />
              <input
                type="text"
                value={editingBook.category}
                onChange={(e) =>
                  setEditingBook({
                    ...editingBook,
                    category: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label>Описание</label>
              <br />
              <textarea
                value={editingBook.description}
                onChange={(e) =>
                  setEditingBook({
                    ...editingBook,
                    description: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label>Тип доступа</label>
              <br />
              <select
                value={editingBook.access}
                onChange={(e) =>
                  setEditingBook({
                    ...editingBook,
                    access: e.target.value as "free" | "paid",
                  })
                }
              >
                <option value="free">Бесплатная</option>
                <option value="paid">Платная</option>
              </select>
            </div>

            <br />

            <button type="submit" disabled={savingBook}>
              {savingBook ? "Сохранение..." : "Сохранить изменения"}
            </button>

            {" "}

            <button
              type="button"
              onClick={() => setEditingBook(null)}
              disabled={savingBook}
            >
              Отмена
            </button>
          </form>
        </>
      )}

      <hr />

      <h2>Заявки на покупку</h2>

      {loading && <p>Загрузка заявок...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <p>Заявок пока нет.</p>
      )}

      {!loading && !error && requests.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Книга</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.book_title}</td>
                <td>{request.name}</td>
                <td>{request.email}</td>
                <td>{request.phone}</td>
                <td>
                  {new Date(request.created_at).toLocaleString("ru-RU")}
                </td>
                <td>
                  <button onClick={() => handleDelete(request.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPage;