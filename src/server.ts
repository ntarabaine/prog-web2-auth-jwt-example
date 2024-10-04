import express from 'express'
import authRoutes from './auth';
import userRoutes from './user';

const app = express()
app.use(express.json())

app.use(express.json())

app.use('/auth', authRoutes)
app.use('/user', userRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})