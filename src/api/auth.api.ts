import "dotenv/config"
import { Router } from "express"
import { createClient } from "@supabase/supabase-js"

const {
    SUPABASE_URL,
    SUPABASE_KEY
} = process.env as {[name:string]: string}

interface UserDetail {
    password: string,
    username: string,
    email: string
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const authApi = Router()

authApi.post("/login", async (req, res) => {
    const { password, email_or_username } = req.body as { password:string, email_or_username:string }
    const { data } =  await supabase
        .from("users")
        .select("id, password, username, email")
        .or(`email.eq.${email_or_username},username.eq.${email_or_username}`)
        .eq("password", password)
        .limit(1)
        .single()
    if (data) {
        res.json({ data , state: "success" })
    } else {
        res.json({ state: "failed", reason: "invalided details" })
    }
})

authApi.post("/signin", async (req, res) => {
    const { email, username, password } = req.body as UserDetail
    const appId = req.body["app-id"] ? req.body["app-id"] : null
    const emailChecker =  await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .limit(1)
        .single()
    if (emailChecker.data) {
        res.json({ state: "failed", reason: "email already exist" })
    } else {
        const usernameChecker = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .limit(1)
            .single()
        if (usernameChecker.data) {
            res.json({ state: "failed", reason: "username already exist" })
        } else {
            const { error, user } = await supabase.auth.api.createUser({
                user_metadata: {
                    password,
                    username,
                    "app-id": appId
                },
                email,
                password,
                email_confirm: true
            })
            if (error) {
                res.json({state: "failed", reason: "backend error"})
            } else {
                res.json({ data: { id :user.id, email, password, username }, state: "success" })
            }
        }
    }
})

export default authApi