import express from 'express'
import dotenv from 'dotenv'
import databaseService from './services/database.service'
import userRoute from './routes/user.route'

dotenv.config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

databaseService.connect()

app.use('/user', userRoute)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})