
import { Router } from "express";
import pool from "../db.js"

const router = Router();

const books = [
  {
    id: 1,
    title: "1984",
    author: "Джордж Оруэлл",
    category: "Антиутопия",
    description: "Роман-антиутопия о мире тотального контроля.",
    access: "free",
  },
  {
    id: 2,
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    category: "Роман",
    description: "Знаменитый роман о Москве, любви и загадочном Воланде.",
    access: "paid",
  },
  {
    id: 3,
    title: "Преступление и наказание",
    author: "Фёдор Достоевский",
    category: "Роман",
    description: "История Родиона Раскольникова и его внутренней борьбы.",
    access: "free",
  },
  {
    id: 4,
    title: "Гарри Поттер и философский камень",
    author: "Дж. К. Роулинг",
    category: "Фэнтези",
    description: "Первая книга о приключениях Гарри Поттера.",
    access: "paid",
  },
  {
    id: 5,
    title: "Властелин колец",
    author: "Дж. Р. Р. Толкин",
    category: "Фэнтези",
    description: "Эпическое путешествие Фродо и его друзей.",
    access: "paid",
  },
];


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


export default router;
