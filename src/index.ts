import express from "express"
import fileUpload from "express-fileupload"
import cors from "cors"
import bodyParser from "body-parser"

const app = express()

const PORT = process.env.PORT || 3030

app.use(cors())

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: true}))

app.use(fileUpload())

app.listen(PORT, () => console.log(`Starting server at http://localhost:${PORT}`))