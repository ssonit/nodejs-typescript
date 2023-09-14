import express from 'express'
import dotenv from 'dotenv'
import databaseService from './services/database.service'
import userRoute from './routes/user.route'
import errorHandler from './middlewares/error.middleware'

dotenv.config()
const app = express()
const port = 4000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

databaseService.connect()

app.use('/', userRoute)

app.use(errorHandler)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
