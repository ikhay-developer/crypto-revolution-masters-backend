import "dotenv/config"
import { Router } from "express"
import multer from "multer"
import { createClient } from "@supabase/supabase-js"

const {
    SUPABASE_URL,
    SUPABASE_KEY
} = process.env as {[name:string]: string}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const uploadApi:Router = Router()

const uploadMiddleware = multer()

uploadApi.post("/:where/", uploadMiddleware.any(), async (req, res) => {
    let files = req.files as Array<any>
    let timeStamp = new Date().toISOString()
    let fileName = `${files.at(0)["originalname"]}_${timeStamp}`
    let buffer = files.at(0)["buffer"]
    if (files != null) {
        if (req.params.where == "message-images") {
            const { error } = await supabase
                .storage
                .from("message-images")
                .upload(fileName, buffer, {
                    cacheControl: '3600',
                    upsert: false
                })
            if (!error) {
                const { data } = supabase
                    .storage
                    .from("message-images")
                    .getPublicUrl(fileName)
                if (data)
                    res.json({state: "success", data: { imageUrl: data.publicURL }})
                else
                    res.json({state: "failed", reason: "backend error"})
            } else {
                res.json({state: "failed", reason: "backend error"})
            }
        } else if (req.params.where == "ads-images") {
            const { error } = await supabase
                .storage
                .from("ads-images")
                .upload(fileName, buffer, {
                    cacheControl: '3600',
                    upsert: false
                })
            if (!error) {
                const { data } = supabase
                    .storage
                    .from("ads-images")
                    .getPublicUrl(fileName)
                if (data)
                    res.json({state: "success", data: { imageUrl: data.publicURL }})
                else
                    res.json({state: "failed", reason: "backend error"})
            } else {
                res.json({state: "failed", reason: "backend error"})
            }
        }
    } else {
        res.json({state: "failed", reason: "backend error"})
    }
})

export default uploadApi