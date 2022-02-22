import "dotenv/config"
import { Router } from "express"
import multer from "multer"
import { uploadFile } from "../services/storage"

const uploadApi:Router = Router()

const uploadMiddleware = multer()

uploadApi.post("/:where/", uploadMiddleware.any(), (req, res) => {
    let files = req.files as Array<any>
    if (files != null) {
        uploadFile(
            `${req.protocol}://${req.headers.host}/${process.env.API_SECRET_KEY}/storage`, 
            String(files.at(0)["originalname"]),
            req.params.where,
            files.at(0)["buffer"]
        ).then(imageUrl => {
            res.json({state: "success", data: { imageUrl }})
        }).catch(_ => {
            res.json({state: "failed", reason: "backend error"})
        })
    } else {
        res.json({state: "failed", reason: "backend error"})
    }
})

export default uploadApi