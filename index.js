import express from 'express'
import rootRoutes from './routes/root.js'
import personagensRoutes from './routes/personagens.js'
import connectDB from './db/connection.js'

const app = express()

app.use(express.json())
app.use('/', rootRoutes)
app.use('/personagens', personagensRoutes)

const startServer = async () => {
    await connectDB()

    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000')
    })
}

startServer().catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
})