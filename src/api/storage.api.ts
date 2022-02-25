import { Router } from "express"
import { getStream, ref, deleteObject, listAll } from "firebase/storage"
import storage from "../services/storage"

const storageApi:Router = Router()

storageApi.get("/:directory/:file", async (req, res) => {
    let imgRef = ref(storage, `${req.params.directory}/${req.params.file}`)
    let isExist = (await listAll(imgRef)).items.length > 0 ? true : false
    if (isExist && imgRef != undefined)
        getStream(imgRef).pipe(res)
    else {
        res.statusCode = 400
        res.send(`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Error</title>
          </head>
          <body>
            <pre>
                Cannot GET ${req.method} ${req.url}
            </pre>
          </body>
        </html>`)
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