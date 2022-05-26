import "dotenv/config"
import { Router } from "express"
import multer from "multer"
import { createClient } from "@supabase/supabase-js"
import { Temporal } from "@js-temporal/polyfill"

const {
    SUPABASE_URL,
    SUPABASE_KEY
} = process.env as {[name:string]: string}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const uploadApi:Router = Router()

const uploadMiddleware = multer()

uploadApi.post("/:where/", uploadMiddleware.any(), async (req, res) => {
    let files = req.files as Array<any>
    console.log(files)
    if (files != null) {
        console.log(files)
        let file = files.at(0)
        console.log(file)
        let timeStamp = Temporal.Now.instant().epochMilliseconds.toString()
        let fileName = `${timeStamp}-${file["originalname"]}`
        let buffer = file["buffer"]
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