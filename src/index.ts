import "dotenv/config"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import userApi from "./api/user.api"
import coinsApi from "./api/coins.api"
import adminApi from "./api/admin.api"
import uploadApi from "./api/upload.api"
import storageApi from "./api/storage.api"
import { join } from "path"
import authApi from "./api/auth.api"

const app = express()

const PORT = process.env.PORT || 3030

app.use(cors())

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: true}))

app.use(`/${process.env.API_SECRET_KEY}/user`, userApi)

app.use(`/${process.env.API_SECRET_KEY}/coins`, coinsApi)

app.use(`/${process.env.API_SECRET_KEY}/admin`, adminApi)

app.use(`/${process.env.API_SECRET_KEY}/upload`, uploadApi)

app.use(`/${process.env.API_SECRET_KEY}/storage`, storageApi)

app.use(`/${process.env.API_SECRET_KEY}/auth`, authApi)

app.use(express.static("public"))

app.get("/dashboard", (_, res) => {
    res.sendFile(join(__dirname, "dashboard/index.html"))
})

app.listen(PORT, () => console.log(`Starting server at http://localhost:${PORT}`))