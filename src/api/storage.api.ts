import { createClient } from "@supabase/supabase-js"
import { Router } from "express"

const storageApi:Router = Router()

const {
    SUPABASE_URL,
    SUPABASE_KEY
} = process.env as {[name:string]: string}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

storageApi.delete("/:directory/:file", async (req, res) => {
    let directory = req.params.directory
    let file = req.params.file
    const { error } = await supabase
        .storage
        .from(directory)
        .remove([file])
    if (!error)
        res.json({ state: "success" })
    else
        res.json({ state: "failed", reason: "backend error" })
})

export default storageApi