
import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { bookId, name, email, phone } = req.body;

    if (
      !bookId ||
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim()
    ) {
      res.status(400).json({
        message: "Заполните все поля",
      });
      return;
    }

    const book = await pool.query(
      "SELECT id FROM books WHERE id = $1 AND access = 'paid'",
      [bookId]
    );

    if (book.rows.length === 0) {
      res.status(404).json({
        message: "Платная книга не найдена",
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO purchase_requests
       (book_id, name, email, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [bookId, name.trim(), email.trim(), phone.trim()]
    );

    res.status(201).json({
      message: "Заявка успешно создана",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка создания заявки:", error);

    res.status(500).json({
      message: "Не удалось создать заявку",
    });
  }
});

export default router;
