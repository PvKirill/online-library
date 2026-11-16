import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      res.status(400).json({
        message: "Введите логин и пароль",
      });
      return;
    }

    const result = await pool.query(
      "SELECT id, username, password_hash FROM admins WHERE username = $1",
      [username.trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        message: "Неверный логин или пароль",
      });
      return;
    }

    const admin = result.rows[0];
    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      res.status(401).json({
        message: "Неверный логин или пароль",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET не настроен");
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      secret,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Авторизация успешна",
      token,
    });
  } catch (error) {
    console.error("Ошибка авторизации:", error);

    res.status(500).json({
      message: "Ошибка сервера при авторизации",
    });
  }
});

export default router;