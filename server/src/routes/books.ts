import { Router } from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Управление каталогом книг
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Получение списка книг
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию или автору
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтрация по категории
 *       - in: query
 *         name: access
 *         schema:
 *           type: string
 *           enum: [free, paid]
 *         description: Тип доступа к книге
 *     responses:
 *       200:
 *         description: Список книг
 *       500:
 *         description: Ошибка загрузки книг
 */
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "");
    const category = String(req.query.category || "");
    const access = String(req.query.access || "");

    const result = await pool.query(
      `SELECT id, title, author, category, description, access
       FROM books
       WHERE
         (title ILIKE '%' || $1 || '%' OR author ILIKE '%' || $1 || '%')
         AND ($2 = '' OR category = $2)
         AND ($3 = '' OR access = $3)
       ORDER BY id`,
      [search, category, access]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки книг:", error);

    res.status(500).json({
      message: "Не удалось загрузить книги из базы данных",
    });
  }
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Добавление новой книги
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - category
 *               - description
 *               - access
 *             properties:
 *               title:
 *                 type: string
 *                 example: Мастер и Маргарита
 *               author:
 *                 type: string
 *                 example: Михаил Булгаков
 *               category:
 *                 type: string
 *                 example: Роман
 *               description:
 *                 type: string
 *                 example: Известный роман Михаила Булгакова
 *               access:
 *                 type: string
 *                 enum: [free, paid]
 *     responses:
 *       201:
 *         description: Книга успешно добавлена
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Требуется авторизация
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, author, category, description, access } = req.body;

    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      typeof category !== "string" ||
      typeof description !== "string" ||
      !title.trim() ||
      !author.trim() ||
      !category.trim() ||
      !description.trim() ||
      !["free", "paid"].includes(access)
    ) {
      res.status(400).json({
        message: "Проверьте правильность заполнения всех полей",
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO books (title, author, category, description, access)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, author, category, description, access`,
      [
        title.trim(),
        author.trim(),
        category.trim(),
        description.trim(),
        access,
      ]
    );

    res.status(201).json({
      message: "Книга успешно добавлена",
      book: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка добавления книги:", error);

    res.status(500).json({
      message: "Не удалось добавить книгу",
    });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Редактирование книги
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Идентификатор книги
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - category
 *               - description
 *               - access
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               access:
 *                 type: string
 *                 enum: [free, paid]
 *     responses:
 *       200:
 *         description: Книга успешно обновлена
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Требуется авторизация
 *       404:
 *         description: Книга не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "Некорректный номер книги",
      });
      return;
    }

    const { title, author, category, description, access } = req.body;

    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      typeof category !== "string" ||
      typeof description !== "string" ||
      !title.trim() ||
      !author.trim() ||
      !category.trim() ||
      !description.trim() ||
      !["free", "paid"].includes(access)
    ) {
      res.status(400).json({
        message: "Проверьте правильность заполнения всех полей",
      });
      return;
    }

    const result = await pool.query(
      `UPDATE books
       SET title = $1,
           author = $2,
           category = $3,
           description = $4,
           access = $5
       WHERE id = $6
       RETURNING id, title, author, category, description, access`,
      [
        title.trim(),
        author.trim(),
        category.trim(),
        description.trim(),
        access,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Книга не найдена",
      });
      return;
    }

    res.json({
      message: "Книга успешно обновлена",
      book: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка редактирования книги:", error);

    res.status(500).json({
      message: "Не удалось обновить книгу",
    });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Удаление книги
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Идентификатор книги
 *     responses:
 *       200:
 *         description: Книга успешно удалена
 *       400:
 *         description: Некорректный номер книги
 *       401:
 *         description: Требуется авторизация
 *       404:
 *         description: Книга не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "Некорректный номер книги",
      });
      return;
    }

    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Книга не найдена",
      });
      return;
    }

    res.json({
      message: "Книга успешно удалена",
    });
  } catch (error) {
    console.error("Ошибка удаления книги:", error);

    res.status(500).json({
      message: "Не удалось удалить книгу",
    });
  }
});

export default router;