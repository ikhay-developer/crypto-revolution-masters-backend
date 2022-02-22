import "dotenv/config"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import userApi from "./api/user.api"
import coinsApi from "./api/coins.api"
import adminApi from "./api/admin.api"
import uploadApi from "./api/upload.api"

const app = express()

const PORT = process.env.PORT || 3030

app.use(cors())

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: true}))

app.use(`/${process.env.API_SECRET_KEY}/user`, userApi)

app.use(`/${process.env.API_SECRET_KEY}/coins`, coinsApi)

app.use(`/${process.env.API_SECRET_KEY}/admin`, adminApi)

app.use(`/${process.env.API_SECRET_KEY}/upload`, uploadApi)

app.listen(PORT, () => console.log(`Starting server at http://localhost:${PORT}`))