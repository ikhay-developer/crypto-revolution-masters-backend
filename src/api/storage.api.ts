import { Router } from "express"
import { getStream, ref, deleteObject, getDownloadURL } from "firebase/storage"
import storage from "../services/storage"

const storageApi:Router = Router()

storageApi.get("/:directory/:file", (req, res) => {
    let imgRef = ref(storage, `${req.params.directory}/${req.params.file}`)
    try {
        getStream(imgRef).pipe(res)
    } catch (error) {
        res.statusCode = 400
        let errorPage = String('<!DOCTYPE html>')
            .concat('<html lang="en">')
            .concat('<head>')
            .concat('<meta charset="utf-8">\n<title>Error</title>')
            .concat('</head>')
            .concat('<body>')
            .concat(`<pre>\nCannot GET ${req.method} ${req.url}\n</pre>`)
            .concat('</body>')
        res.send(errorPage)
    }
})

storageApi.delete("/:directory/:file", (req, res) => {
    let imgRef = ref(storage, `${req.params.directory}/${req.params.file}`)
    deleteObject(imgRef)
    .then(_ => res.json({ state: "success" }))
    .catch(e => {
        if (e.code == "storage/object-not-found")
            res.json({ state: "success" })
        else
            res.json({ state: "failed", reason: "backend error" })
    })
        
})

export default storageApi