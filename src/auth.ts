import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { initDatabase } from './database';
const router = express.Router();
const SECRET_KEY = 'sua_chave_secreta';

router.post('/register', async (req: Request, res: Response) => {
  const { name, cpf, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await initDatabase();
  try {
    await db.run(
      `INSERT INTO users (name, cpf, email, password) VALUES  (?, ?, ?, ?)`, [name, cpf, email, hashedPassword, role || 'user']
    );
    res.status(201).json(
      { message: 'Usuario registrado com sucesso' }
    );
  } catch (error) {
    res.status(400).json({ error: 'Usuário já existe' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = await initDatabase();
  
  const user = await db.get(
    `SELECT * FROM users WHERE email = ?`, [email]
  );
  
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email,
      role: user.role
    }, SECRET_KEY, { expiresIn: '15m',});
    const refreshToken = jwt.sign(
      { id: user.id }, SECRET_KEY, { expiresIn: '7d' }
    );
    await db.run(`INSERT INTO refresh_tokens (userId, token) VALUES (?, ?)`, [user.id, refreshToken]);
    
    res.json({ token, refreshToken });  
  } else {
    res.status(401).json({ error: 'Credenciais inválidas'});
  } 
});


router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const db = await initDatabase();
  if (!refreshToken) {
    return res.status(401).json({ error: 'Token de atualização não fornecido' });
  }
  
  const tokenRecord = await db.get(`SELECT * FROM refresh_tokens WHERE token = ?`, [refreshToken]);
  if (!tokenRecord) {
    return res.status(403).json({ error: 'Token de atualização inválido' });
  }
  
  jwt.verify(refreshToken, SECRET_KEY, (err:any, decoded:any) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token de atualização expirado' 
      });
    }
    const accessToken = jwt.sign(
      { id: decoded.id }, SECRET_KEY, { expiresIn: '15m' }
    );

    res.json({ token: accessToken });
  });
});

export default router;