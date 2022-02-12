import "dotenv/config"
import { Router } from "express"

const authApi = Router()

authApi.get("/", (req, res) => {
    let { secret } = req.body as { secret: string }
    if (secret == process.env.API_SECRET_KEY)
        res.json({ state: "success" })
    else
        res.json({ state: "failed", reason: "invalided secret" })
})

export default authApi