
import { Router } from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Purchase Requests
 *   description: Управление заявками на покупку книг
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         book_id:
 *           type: integer
 *           example: 2
 *         book_title:
 *           type: string
 *           example: Преступление и наказание
 *         name:
 *           type: string
 *           example: Иван Иванов
 *         email:
 *           type: string
 *           example: ivan@example.com
 *         phone:
 *           type: string
 *           example: "+79991234567"
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/purchase-requests:
 *   get:
 *     summary: Получить список заявок
 *     description: Доступно только авторизованному администратору
 *     tags: [Purchase Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заявок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PurchaseRequest'
 *       401:
 *         description: Требуется авторизация
 *       500:
 *         description: Ошибка получения заявок
 */
router.get("/", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pr.id,
        pr.book_id,
        b.title AS book_title,
        pr.name,
        pr.email,
        pr.phone,
        pr.created_at
      FROM purchase_requests pr
      JOIN books b ON b.id = pr.book_id
      ORDER BY pr.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения заявок:", error);

    res.status(500).json({
      message: "Не удалось получить список заявок",
    });
  }
});

/**
 * @swagger
 * /api/purchase-requests/{id}:
 *   delete:
 *     summary: Удалить заявку
 *     tags: [Purchase Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Номер заявки
 *     responses:
 *       200:
 *         description: Заявка успешно удалена
 *       400:
 *         description: Некорректный номер заявки
 *       401:
 *         description: Требуется авторизация
 *       404:
 *         description: Заявка не найдена
 *       500:
 *         description: Ошибка удаления заявки
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "Некорректный номер заявки",
      });
      return;
    }

    const result = await pool.query(
      "DELETE FROM purchase_requests WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Заявка не найдена",
      });
      return;
    }

    res.json({
      message: "Заявка успешно удалена",
    });
  } catch (error) {
    console.error("Ошибка удаления заявки:", error);

    res.status(500).json({
      message: "Не удалось удалить заявку",
    });
  }
});

/**
 * @swagger
 * /api/purchase-requests:
 *   post:
 *     summary: Создать заявку на покупку книги
 *     tags: [Purchase Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               bookId:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Иван Иванов
 *               email:
 *                 type: string
 *                 example: ivan@example.com
 *               phone:
 *                 type: string
 *                 example: "+79991234567"
 *     responses:
 *       201:
 *         description: Заявка успешно создана
 *       400:
 *         description: Не все поля заполнены
 *       404:
 *         description: Платная книга не найдена
 *       500:
 *         description: Ошибка создания заявки
 */

router.post("/", async (req, res) => {
  try {
    const { bookId, name, email, phone } = req.body;

    const parsedBookId = Number(bookId);

    if (
      !Number.isInteger(parsedBookId) ||
      parsedBookId <= 0 ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof phone !== "string" ||
      !phone.trim()
    ) {
      res.status(400).json({
        message: "Проверьте правильность заполнения всех полей",
      });
      return;
    }

    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const normalizedName = name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+0-9()\-\s]{5,20}$/;

    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        message: "Некорректный адрес электронной почты",
      });
      return;
    }

    if (!phoneRegex.test(normalizedPhone)) {
      res.status(400).json({
        message: "Некорректный номер телефона",
      });
      return;
    }

    if (normalizedName.length > 100) {
      res.status(400).json({
        message: "Имя не должно превышать 100 символов",
      });
      return;
    }

    const book = await pool.query(
      "SELECT id FROM books WHERE id = $1 AND access = 'paid'",
      [parsedBookId]
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
      [parsedBookId, normalizedName, normalizedEmail, normalizedPhone]
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
