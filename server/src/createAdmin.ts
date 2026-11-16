import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

async function createAdmin() {
  const username = "admin";
  const password = "admin123";

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admins (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      [username, passwordHash]
    );

    console.log("Администратор создан!");
  } catch (error) {
    console.error("Ошибка создания администратора:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();