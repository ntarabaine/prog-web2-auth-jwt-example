import express, {Request, Response} from 'express'
import { authMiddleware } from './middleware/authMiddleware'
import { roleMiddleware } from './middleware/roleMiddleware'

const router = express.Router();

router.get('/profile', authMiddleware,
  (req:Request, res:Response) =>{
    res.json({
      message: 'Seu Perfil', user: req.user
    })
  }
)

router.get('/admin', authMiddleware, roleMiddleware(['admin']), (req: Request, res: Response) => {
  res.json({ 
    message: 'Conteúdo exclusivo para administradores', 
    user: req.user 
  });
  
});

export default router