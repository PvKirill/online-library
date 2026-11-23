
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  admin?: {
    id: number;
    username: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Требуется авторизация",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "Требуется авторизация",
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "Секретный ключ не настроен",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id: number;
      username: string;
    };

    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({
      message: "Недействительный или просроченный токен",
    });
  }
}
