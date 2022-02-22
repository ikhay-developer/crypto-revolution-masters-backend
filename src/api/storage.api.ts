import { Router } from "express"
import { getStream, ref } from "firebase/storage"
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

export default storageApi