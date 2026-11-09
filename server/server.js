import express from 'express'
import { httpServerHandler } from 'cloudflare:node'
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'

const app = express()

await connectCloudinary()

app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) => res.send('Server is Live'))

// Use route-level authentication (per-route `auth` middleware)
app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

const PORT = 3000

app.listen(PORT)

export default httpServerHandler({ port: PORT })
