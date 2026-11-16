
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import booksRouter from "./routes/books.js";
import pool from "./db.js";
import purchaseRequestsRouter from "./routes/purchaseRequests.js";
import authRouter from "./routes/auth.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/books", booksRouter);
app.use("/api/auth", authRouter);
app.use("/api/purchase-requests", purchaseRequestsRouter);

app.get("/api/admin/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Доступ разрешён",
    admin: (req as import("./middleware/authMiddleware.js").AuthRequest).admin,
  });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Online Library API is running!",
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      database: "connected",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      database: "error",
      message: "Не удалось подключиться к базе данных",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
