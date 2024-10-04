import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload | string;

    // Verifica se 'user' é um objeto e possui o campo 'role'
    if (typeof user !== 'string' && user.role && roles.includes(user.role)) {
      next();
    } else {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};