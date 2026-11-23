
import { useState, type FormEvent } from "react";
import type { Book } from "../types/Book";

interface BookReaderProps {
    book: Book;
    pages: string[];
}

function BookReader({ book, pages }: BookReaderProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [purchaseMessage, setPurchaseMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const isPaid = book.access === "paid";
    const freePageLimit = 20;
    const isLocked = isPaid && currentPage > freePageLimit;
    const totalPages = pages.length;

    function nextPage() {
        if (currentPage < totalPages) {
            setCurrentPage((page) => page + 1);
        }
    }

    function previousPage() {
        if (currentPage > 1) {
            setCurrentPage((page) => page - 1);
        }
    }

    async function handlePurchase(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) return;

        setPurchaseMessage("");
        setSubmitting(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/purchase-requests",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        bookId: book.id,
                        name,
                        email,
                        phone,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Ошибка отправки заявки");
            }

            setPurchaseMessage("Заявка успешно отправлена!");
            setName("");
            setEmail("");
            setPhone("");
        } catch (error) {
            setPurchaseMessage(
                error instanceof Error
                    ? error.message
                    : "Не удалось отправить заявку"
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="reader">
            <h2>📖 Читалка</h2>

            <div className="reader-page">
                {isLocked ? (
                    <div>
                        <h3>Бесплатные страницы закончились</h3>

                        <p>
                            Для продолжения чтения необходимо приобрести книгу.
                        </p>

                        <form onSubmit={handlePurchase} className="purchase-form">
                            {purchaseMessage && (
                                <p>{purchaseMessage}</p>
                            )}

                            <input
                                type="text"
                                placeholder="Ваше имя"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                            />

                            <input
                                type="email"
                                placeholder="Электронная почта"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />

                            <input
                                type="tel"
                                placeholder="Номер телефона"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                required
                            />

                            <button
                                type="submit"
                                className="details-button"
                                disabled={submitting}
                            >
                                {submitting ? "Отправка..." : "Отправить заявку"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <p>{pages[currentPage - 1]}</p>
                )}
            </div>

            <div className="reader-controls">
                <button
                    onClick={previousPage}
                    disabled={currentPage === 1}
                >
                    ← Назад
                </button>

                <span>
                    Страница {currentPage} из {totalPages}
                </span>

                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                >
                    Вперёд →
                </button>
            </div>

            {isPaid && (
                <p className="reader-hint">
                    Бесплатно доступны первые {freePageLimit} страниц.
                </p>
            )}
        </div>
    );
}

export default BookReader;
