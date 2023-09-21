import express from 'express'
import dotenv from 'dotenv'
import databaseService from './services/database.service'
import userRouter from './routes/user.route'
import mediaRouter from './routes/media.route'
import serveRouter from './routes/serve.route'
import errorHandler from './middlewares/error.middleware'
import { initFolder } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'

dotenv.config()
const app = express()
const port = 4000

initFolder()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
})

app.use('/', userRouter)
app.use('/media', mediaRouter)
app.use('/static', serveRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(errorHandler)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
