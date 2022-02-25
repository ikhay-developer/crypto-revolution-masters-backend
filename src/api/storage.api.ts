import { Router } from "express"
import { getStream, ref, deleteObject } from "firebase/storage"
import storage from "../services/storage"

const storageApi:Router = Router()

storageApi.get("/:directory/:file", (req, res) => {
    let imgRef = ref(storage, `${req.params.directory}/${req.params.file}`)
    if (imgRef != undefined)
        getStream(imgRef).pipe(res)
    else {
        res.statusCode = 400
        res.send(`<pre>Cannot GET ${req.method} /${req.url}</pre>`)
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